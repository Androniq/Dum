import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { asyncComponent } from 'react-async-component';

export default function withEverything(Component, styles, apiCall)
{
    var StyledComponent = withStyles(styles)(Component);
    return context =>
    {
        var rehydData = context && context.rehydrateState && context.rehydrateState.resolved && context.rehydrateState.resolved.data;
        return routerProps =>
        {
            if (!apiCall) // this is a dataless page, like Login or About
                return <StyledComponent {...routerProps} context={context} />;
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
                matchedApiUrl = resolveApi(matchedApiUrl, props.match.params);
            }
            if (rehydData && matchedApiUrl && rehydData[matchedApiUrl])
            {
                data = rehydData[matchedApiUrl];
            }
            else
            {
                if (matchedApiUrl)
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

function resolveApi(apiCall, matchParams)
{
    if (!apiCall)
        return null;
    if (typeof apiCall === 'object' && apiCall.length)
    {
        for (let index = 0; index < apiCall.length; index++)
        {
            var apiOption = apiCall[index];
            if (apiOption.condition && apiOption.condition(matchParams))
                return resolveApi(apiOption.value, matchParams);
            if (typeof apiOption === 'string')
                return resolveApi(apiOption, matchParams);
        }
        return null; // no condition met
    }

    for (var paramName in matchParams)
    {
        apiCall = apiCall.replace(':' + paramName, matchParams[paramName]);
    }
    return apiCall;
}