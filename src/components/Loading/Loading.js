import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loading.css';
import withEverything from '../../withEverything';

class Loading extends React.Component
{
    randomColor()
    {
        const letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
      

    render()
    {
        return (
            <div className={s.container}>
                <div className={s.absoluteContainer}>
                    {Array.from(Array(300).keys()).map(index=>(
                        <div key={index} className={s.bubble}
                        style={{ top: `${Math.random()*400}px`, left: `${Math.random()*980}px`, animationDelay: `${Math.random()*5}s`,
                        backgroundColor: `${this.randomColor()}` }} />
                    ))}
                    
                    <span className={s.loaderText}>Завантаження...</span>
                </div>
            </div>
        );
    }
}

var withEv = withEverything(Loading, s);

export { withEv as LoadingWithEverything };

export default withStyles(s)(Loading);