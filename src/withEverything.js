import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { asyncComponent } from 'react-async-component';

export default function withEverything(Component, styles, apiCall)
{
    var StyledComponent = withStyles(styles)(Component);
    return props =>
    {
        if (props.data)
        {
            return <StyledComponent {...props} />;
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
                var matchedApiUrl = apiCall;
                if (props.match && props.match.params)
                {
                    for (var paramName in props.match.params)
                    {
                        matchedApiUrl = matchedApiUrl.replace(':' + paramName, props.match.params[paramName]);
                    }
                }
                var fetchReq = await fetchMethod(matchedApiUrl, { method: 'GET' });
                var fetchJson = await fetchReq.json();
                if (props.staticContext)
                {
                    props.staticContext.data = fetchJson;
                }
                return (WrappedComponent =>
                {
                    class Hoc extends React.Component // HOC ad hoc!
                    {
                        render()
                        {
                            return <WrappedComponent {...props} data={fetchJson} />;
                        }
                    }
                    return Hoc;
                })(StyledComponent);
            },
            LoadingComponent: () => <div style={{"text-align":"center","font-weight":"bold"}}>ЗОҐвантаження!</div>,
            serverMode: "resolve",
            env: process.env.IS_SERVER ? "node" : "browser"
        });
        return <AsyncComponent {...props} />
    };
}