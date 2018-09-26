import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { asyncComponent } from 'react-async-component';
import Layout from './components/Layout/Layout';

// This function amends top-level React Components (app routes)
// with everything they need:
// 1. Layout (header, navigation panel etc.)
// 2. CSS styles (isomorphic style loader)
// 3. Data to fetch from the Express server
// 4. Context (common data shared by all components)
// 5. Router props (history, location and match)
// 6. Rehydrated data (preloaded on SSR into HTML)
// Context will be injected by the App, and router props by Routes.
export default function withEverything(Component, styles, apiCall)
{
    var StyledComponent = withStyles(styles)(Component);
    return context =>
    {
        var rehydData = context && context.rehydrateState && context.rehydrateState.resolved && context.rehydrateState.resolved.data;
        return routerProps =>
        {
            context.pathname = routerProps.location.pathname;

            var allProps = { ...routerProps };
            allProps.context = context;

            if (!apiCall) // this is a dataless page, like Login or About
                return <Layout><StyledComponent {...allProps} /></Layout>;
            return applyData(StyledComponent, apiCall, allProps, rehydData);            
        }
    }
}


function applyData(Component, apiCall, props, rehydData)
{
    if (props.data)
    {            
        return <Layout {...props}><Component {...props} /></Layout>;
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
    return <Layout {...props}><AsyncComponent {...props} /></Layout>
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