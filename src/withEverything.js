import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { asyncComponent } from 'react-async-component';
import { UserContext } from './UserContext';
import { withRouter } from 'react-router-dom';

export default function withEverything(Component, styles, apiCall)
{
    var StyledComponent = withStyles(styles)(Component);
    return context =>
    {
        var rehydData = context && context.rehydrateState && context.rehydrateState.resolved && context.rehydrateState.resolved.data;
        return routerProps =>
        {
            return applyData(StyledComponent, apiCall, routerProps, rehydData);            
        }
    }
}


function applyData(Component, apiCall, props, rehydData)
{
    if (props.data)
    {            
        return <Component {...props} />;
    }
    var fetchMethod;
    if (process.env.IS_SERVER)
    {
        fetchMethod = props.staticContext.fetch;
    }
    else
    {
        fetchMethod = fetch;
    }
    const AsyncComponent = asyncComponent(
    {
        resolve: async () =>
        {
            var data = null;
            var matchedApiUrl = apiCall;
            if (props.match && props.match.params)
            {
                for (var paramName in props.match.params)
                {
                    matchedApiUrl = matchedApiUrl.replace(':' + paramName, props.match.params[paramName]);
                }
            }
            if (rehydData && rehydData[matchedApiUrl])
            {
                data = rehydData[matchedApiUrl];
            }
            else
            {
                var fetchReq = await fetchMethod(matchedApiUrl, { method: 'GET' });
                data = await fetchReq.json();
                if (process.env.IS_SERVER)
                {
                    if (!props.staticContext.data)
                        props.staticContext.data = {};
                    props.staticContext.data[matchedApiUrl] = data;
                }
            }
            return (WrappedComponent =>
            {
                class Hoc extends React.Component // HOC ad hoc!
                {
                    render()
                    {
                        return <WrappedComponent {...props} data={data} />;
                    }
                }
                return Hoc;
            })(Component);
        },
        LoadingComponent: () => <div style={{"textAlign":"center","fontWeight":"bold"}}>ЗОҐвантаження!</div>,
        serverMode: "resolve",
        env: process.env.IS_SERVER ? "node" : "browser"
    });
    return <AsyncComponent {...props} />
}