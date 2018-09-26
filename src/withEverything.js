import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { asyncComponent } from 'react-async-component';
import { UserContext } from './UserContext';

export default function withEverything(Component, styles, apiCall)
{
    var StyledComponent = withStyles(styles)(Component);
    var ContextedStyledComponent = withContext(StyledComponent);
    return applyData(ContextedStyledComponent, apiCall);
}

function withContext(Component)
{
    var hocFunc = Wrapped =>
    {
        class Hoc extends React.Component
        {
            render()
            {
                return (
                    <UserContext.Consumer>
                        {context => (
                            <Wrapped {...this.props} context={context} />
                        )}
                    </UserContext.Consumer>
                );
            }
        }
        return Hoc;
    }
    return hocFunc(Component);
}

function applyData(Component, apiCall)
{
    return props =>
    {        
        if (!process.env.IS_SERVER)
        {
            console.info(props);
        }
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
                var matchedApiUrl = apiCall;
                if (props.match && props.match.params)
                {
                    for (var paramName in props.match.params)
                    {
                        matchedApiUrl = matchedApiUrl.replace(':' + paramName, props.match.params[paramName]);
                    }
                }
                var fetchReq = await fetchMethod(matchedApiUrl, { method: 'GET' });
                var data = await fetchReq.json();
                if (process.env.IS_SERVER)
                {
                    props.staticContext.data = data;
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
    };
}