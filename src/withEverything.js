import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { asyncComponent } from 'react-async-component';
import Layout from './components/Layout/Layout';
import Loading from './components/Loading/Loading';

// This function amends top-level React Components (app routes)
// with everything they need:
// 1. Layout (header, navigation panel etc.)
// 2. CSS styles (isomorphic style loader)
// 3. Data to fetch from the Express server
// 4. Context (common data shared by all components)
// 5. Router props (history, location and match)
// 6. Rehydrated data (preloaded on SSR into HTML)
// Context will be provided by the App, and router props by Routes.
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
                return <Layout {...allProps}><StyledComponent {...allProps} /></Layout>;
            return applyData(StyledComponent, apiCall, allProps, rehydData);            
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            await sleep(5000);
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
        LoadingComponent: () => <Loading />,
        serverMode: "resolve",
        env: process.env.IS_SERVER ? "node" : "browser"
    });
    return <Layout {...props}><AsyncComponent {...props} /></Layout>
}

function resolveApi(apiCall, matchParams)
{
    if (!apiCall)
        return null; // no API provided - no data needed

    if (typeof apiCall === 'function')
    {
        return apiCall(matchParams); // custom function (match.Params => API URL) provided
    }

    if (typeof apiCall === 'object' && apiCall.length) // array of condition/value pairs provided - first met condition is returned
    {
        for (let index = 0; index < apiCall.length; index++)
        {
            var apiOption = apiCall[index];
            if (apiOption.condition && apiOption.condition(matchParams))
                return resolveApi(apiOption.value, matchParams);
            if (typeof apiOption === 'string') // string is the default value in the sequence if no condition is met
                return resolveApi(apiOption, matchParams);
        }
        return null; // no condition met and no default provided
    }

    for (var paramName in matchParams) // just string - only substitute :parameters with URL matches from Router
    {
        apiCall = apiCall.replace(':' + paramName, matchParams[paramName]);
    }
    return apiCall;
}