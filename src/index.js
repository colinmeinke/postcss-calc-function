import math from 'mathjs';
import postcss from 'postcss';

const pattern = 'calc(';

const validUnits = [
  '%',
  'ch',
  'cm',
  'em',
  'ex',
  'in',
  'mm',
  'pc',
  'pt',
  'px',
  'rem',
  'vh',
  'vmax',
  'vmin',
  'vw',
];

const getExpressionUnits = expression => {
  const units = validUnits.filter( u => expression.includes( u ));

  const unitlessExpression = units.reduce(( e, u ) => e.replace(
    new RegExp( u, 'g' ), ''
  ), expression );

  return { units, unitlessExpression };
};

const getCalcMatches = input => {
  let matches = [];

  if ( input.includes( pattern )) {
    const l = input.length;
    const start = input.indexOf( pattern );

    let i = start + pattern.length;
    let openParenthesisCount = 0;

    for ( ; i < l; i++ ) {
      if ( input[ i ] === ')' ) {
        if ( openParenthesisCount ) {
          openParenthesisCount--;
        } else {
          matches.push( input.substring( start, i + 1 ));

          matches = matches.concat(
            getCalcMatches( input.substring( start + i + 1 ))
          );

          break;
        }
      } else if ( input[ i ] === '(' ) {
        openParenthesisCount++;
      }
    }
  }

  return matches;
};

const calcFunction = postcss.plugin( 'postcss-calc-function', () => ( css, result ) => {
  css.walkRules( rule => {
    rule.walkDecls( decl => {
      let { value } = decl;

      // Match calc(...)'s
      const matches = getCalcMatches( value );

      matches.forEach( calc => {
        // Get calc(...)'s mathmatical expression
        const expression = calc.slice( pattern.length, -1 ).trim();

        const { units, unitlessExpression } = getExpressionUnits( expression );

        if ( units.length <= 1 ) {
          try {
            // Run expression through mathjs
            const total = math.eval( unitlessExpression );

            // Replace calc(...) with unitlessCalc result appending any unit
            decl.value = value = value.replace( calc, total + units.join( '' )); // eslint-disable-line no-param-reassign,max-len
          } catch ( error ) {
            result.warn( `Could not resolve ${ calc }: math error` );
          }
        } else {
          result.warn( `Could not resolve ${ calc }: contains multiple unit types` );
        }
      });
    });
  });
});

export default calcFunction;
