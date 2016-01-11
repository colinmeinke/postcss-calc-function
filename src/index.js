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

const doMaths = expression => {
  const { units, unitlessExpression } = getExpressionUnits( expression );

  // If mixed units don't calculate
  if ( units.length > 1 ) {
    return null;
  }

  try {
    return math.eval( unitlessExpression ) + units.join( '' );
  } catch ( error ) {
    return null;
  }
};

const resolveCalcs = input => {
  let output = input;

  // Match calc(...)'s
  const matches = getCalcMatches( input );

  for ( const calc of matches ) {
    // Get calc(...)'s mathmatical expression
    let expression = calc.slice( pattern.length, -1 ).trim();

    // If expression includes `calc` functions
    if ( expression.includes( pattern )) {
      // Resolve `calc` functions before we continue
      expression = resolveCalcs( expression );
    }

    const result = doMaths( expression );

    if ( result !== null ) {
      output = output.replace( calc, result );
    }
  }

  return output;
};

const calcFunction = postcss.plugin( 'postcss-calc-function', () => css => {
  css.walkRules( rule => {
    rule.walkDecls( decl => {
      decl.value = resolveCalcs( decl.value ); // eslint-disable-line no-param-reassign
    });
  });
});

export default calcFunction;
