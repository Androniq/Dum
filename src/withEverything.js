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
                var fetchReq = await fetch(matchedApiUrl);
                var fetchJson = await fetchReq.json();
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
            serverMode: "resolve",
            env: process.env.IS_SERVER ? "node" : "browser"
        });
        console.info(props);
        return <AsyncComponent {...props} />
    };
}