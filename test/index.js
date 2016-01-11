import expect from 'expect';
import postcss from 'postcss';

import customProps from '../src';

const process = css => {
  return postcss([ customProps() ]).process( css );
};

describe( 'rule', () => {
  it( 'should correctly resolve addition expression', () => {
    const input = 'h1 { line-height: calc(1+1+0.2); }';
    const expectedOutput = 'h1 { line-height: 2.2; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve subtraction expression', () => {
    const input = 'h1 { line-height: calc(10-7-.5); }';
    const expectedOutput = 'h1 { line-height: 2.5; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve multiplication expression', () => {
    const input = 'h1 { line-height: calc(0.5*6*.5); }';
    const expectedOutput = 'h1 { line-height: 1.5; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve division expression', () => {
    const input = 'h1 { line-height: calc(10/2/2); }';
    const expectedOutput = 'h1 { line-height: 2.5; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve mixed expression', () => {
    const input = 'h1 { padding: calc(1/2-2+3*4); }';
    const expectedOutput = 'h1 { padding: 10.5; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve negative result', () => {
    const input = 'h1 { left: calc(1-2); }';
    const expectedOutput = 'h1 { left: -1; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve value with multiple `calc` function calls', () => {
    const input = 'h1 { padding: calc(10px+1) calc(20px+2); }';
    const expectedOutput = 'h1 { padding: 11px 22px; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should correctly resolve value with nested `calc` function calls', () => {
    const input = 'h1 { padding: calc(10px+calc(5*calc(5+5))) calc(20px+10px); }';
    const expectedOutput = 'h1 { padding: 60px 30px; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should only resolve `calc` function call within value', () => {
    const input = 'h1 { color: color(red l(+calc(10%*2.5))); }';
    const expectedOutput = 'h1 { color: color(red l(+25%)); }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should prepend correct unit to result', () => {
    const input = 'h1 { font-size: calc(10px*2); }';
    const expectedOutput = 'h1 { font-size: 20px; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should allow multiple terms of the same unit', () => {
    const input = 'h1 { padding: calc(20px+5px); }';
    const expectedOutput = 'h1 { padding: 25px; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should leave mixed unit expression as is', () => {
    const input = 'h1 { font-size: calc(10px*2em); }';
    const expectedOutput = 'h1 { font-size: calc(10px*2em); }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should leave expression as is if calculation errors', () => {
    const input = 'h1 { font-size: calc(foo+bar); }';
    const expectedOutput = 'h1 { font-size: calc(foo+bar); }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should allow whitespace within `calc` function call', () => {
    const input = 'h1 { line-height: calc( 1 + 1 ); }';
    const expectedOutput = 'h1 { line-height: 2; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });

  it( 'should allow parenthesis within `calc` function calls', () => {
    const input = 'h1 { padding: calc(5px*(10px+2px)) calc(0.5*(10+20px)); }';
    const expectedOutput = 'h1 { padding: 60px 15px; }';

    return process( input ).then(({ css }) => {
      expect( css ).toEqual( expectedOutput );
    });
  });
});
