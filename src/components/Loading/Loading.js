import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loading.css';
import withEverything from '../../withEverything';
import seedrandom from '../../serverLogic/thirdParty/seedrandom';

class Loading extends React.Component
{
    randomColor(rnd)
    {
        const letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(rnd() * 16)];
        }
        return color;
    }

    tryResolve(object, propNames)
    {
        if (!object)
            return null;
        propNames.forEach(propName =>
        {
            var next = object[propName];
            if (!next) return null;
            object = next;
        });
        return object;
    }

    render()
    {
        var seed = 'default'; // sync random so client uses same seed as server and no SSR warnings are produced
        if (process.env.IS_SERVER)
        {
            seed += Math.random(); // we're on server - initial random seed
            if (!this.props.context.data) // test page /loading
                this.props.context.data = {};
            this.props.context.data.seed = seed; // save to rehydrate
        }
        else
        {
            // load from rehydrate, if it fails - means that SSR is broken at the moment, so just generate new value
            seed = this.tryResolve(this.props, ['context', 'rehydrateState', 'resolved', 'data', 'seed']) || ('client'+Math.random());
        }
        var rnd = new seedrandom(seed);
        return (
            <div className={s.container}>
                <div className={s.absoluteContainer}>
                    {Array.from(Array(300).keys()).map(index=>(
                        <div key={index} className={s.bubble}
                        style={{ top: `${rnd()*400}px`, left: `${rnd()*980}px`, animationDelay: `${rnd()*5}s`,
                        backgroundColor: `${this.randomColor(rnd)}` }} />
                    ))}
                    
                    <span className={s.loaderText}>{this.props.message || "Завантаження..."}</span>
                </div>
            </div>
        );
    }
}

var withEv = withEverything(Loading, s, null,
    { message: "Ця сторінка завантажується вічно (вона призначена для тестування т. зв. теліпатора – кольорових плямок при завантаженні сторінки)" });

export { withEv as LoadingWithEverything };

export default withStyles(s)(Loading);