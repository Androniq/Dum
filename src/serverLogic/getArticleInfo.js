import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate } from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER } from '../utility';

export default async function getArticleInfo(user, { id })
{
    const article = await mongoAsync.dbCollections.articles.findOne({ Url: id });
    if (!article)
    {
        return { status: 404, localMessage: 'Нема такої статті' };
    }
    const loadData = [];
    const voteResults = [];
    const votes = mongoAsync.preloads.votes;
    const priorities = mongoAsync.preloads.priorities;
        
    let argumentList;
    let ownVote = 'N';
    let ownVoteInstance;
    let isLoggedIn = user !== null;
        
      loadData.push(
        mongoAsync.dbCollections.arguments
                .find({ Article: article.ID }, { sort: "CreatedDate" })			
          .toArray()
          .then(it => (argumentList = it)),
      );
      votes.forEach(element => {
        const voteItem = { vote: element, popular: 0 };
        voteResults.push(voteItem);
        loadData.push(
          mongoAsync.dbCollections.popularVote
            .countDocuments({ Article: article.ID, Vote: element.ID, Active: true })
            .then(it => voteItem.popular = it),
        );
        });
        
      if (isLoggedIn)
      {
        loadData.push(
          mongoAsync.dbCollections.popularVote
            .findOne({ Article: article.ID, User: user._id })
            .then(it => (ownVoteInstance = it)),
        )
      }
      await Promise.all(loadData);
    
        if (ownVoteInstance)
      {
        votes.forEach(element => 
        {
          if (element.ID === ownVoteInstance.Vote)
          {
            ownVote = element.Code;
          }
        })
      }
    
      var totalPopular = 0; // total number of popular votes on this article
        var popularCounter = []; // array to count popular votes
    
        // for each vote option...
        for (let voteIndex = 0; voteIndex < voteResults.length; voteIndex++)
        {
            let vote = voteResults[voteIndex].vote;
            vote.index = voteIndex; // temporarily store index in vote option to navigate arrays easier within this method
            vote.priorityCount = 0; // how many priorities (categories of arguments) speak in favor of this option
            vote.ShortDescription = vote.ShortDescriptionTemplate.replace('%A%', article.ShortA).replace('%B%', article.ShortB);
            vote.ShortestDescription = vote.ShortDescriptionTemplate.replace('%A%', shortLabel(article.ShortA)).replace('%B%', shortLabel(article.ShortB));
            let popularVote = voteResults[voteIndex].popular;
            totalPopular += popularVote; // add up to total number of popular votes
            popularCounter.push(popularVote); // push the number into the array
        }
    
        var factor = 100.0 / totalPopular; // we will multiply by this to get percentage values of popular vote on each option
        var popularVoteResult = null; // first we assume that popular vote did not reach its quota (absolute majority)
    
        var globalVoteCounter = []; // one more number array - now for argumented voting
        
        // for each vote option...
        for (let voteIndex = 0; voteIndex < voteResults.length; voteIndex++)
        {
            globalVoteCounter.push(0); // initialize global counter;
            let popularVote = voteResults[voteIndex].popular;
            voteResults[voteIndex].popular = (popularVote * factor).toFixed(2); // we convert asolute vote numbers to percentages
            if (2 * popularVote > totalPopular) // if this option scored more than half of total votes, then popular vote met its quota and...
                popularVoteResult = voteResults[voteIndex].vote; // ...we store this option as the result of popular vote
        }
    
        var priorityList = []; // will contain groups of arguments
    
        // for each argument category...
        for (let priorIndex = 0; priorIndex < priorities.length; priorIndex++)
        {
            var priority = priorities[priorIndex];
            var entry = { priority : priority, arguments : [] };
            var voteCounter = []; // argument counter
            for (let voteIndex = 0; voteIndex < voteResults.length; voteIndex++)
            {
                voteCounter.push(0); // initialize the counter with zero for each vote option
        }
        
            // for each argument...
            for (let argumentIndex = 0; argumentIndex < argumentList.length; argumentIndex++)
            {
                let argument = argumentList[argumentIndex];
                
                // ...that falls in the current category...
                if (argument.Priority === priority.ID)
                {
                    entry.arguments.push(argument); // store it in the client results
                    for (let voteIndex = 0; voteIndex < voteResults.length; voteIndex++)
                    {
                        let vote = voteResults[voteIndex].vote;
                        if (vote.ID === argument.Vote) // find the vote option it favors
                        {
                            argument.voteFor = vote.ShortDescription; // store short description here for client's convenience (redundant but handy data)
                            voteCounter[voteIndex]++; // update the counter
                        }
                    }
                }
            }
    
            var maxVotes = max(voteCounter); // get vote results
            var priorityVote = null; // first we assume this category failed to elect an option
            if (maxVotes.count === 1) // if we have exactly one top-vote option...
            {
                priorityVote = voteResults[maxVotes.firstIndex].vote; // ...then it is our champion, unless...
            }
    
            var popularOverride = priority.IsPopular && popularVoteResult !== null;
            priority.popularOverride = popularOverride;
            if (popularOverride) // ...we're speaking of the 'Popularity' priority...
            {
                priorityVote = popularVoteResult; // ...and it gets overridden with successful popular vote (more than 50% on one and the same option)
            }
    
            entry.voteFor = '-';
            if (priorityVote !== null)
            {
                entry.voteFor = priorityVote.ShortDescription; // another convenient redundancy
                priorityVote.priorityCount++; // probably also redundant
                globalVoteCounter[priorityVote.index]++; // update the counter on the vote option
            }
    
            priorityList.push(entry);
      }
      
        var colorCode = 'N'; // as usual, first we assume color code 'N', which means we have no answer to the question in the article
        var globalResults = max(globalVoteCounter); // count the global vote results
        if (globalResults.count === 1 && globalResults.value > 1) // if we have exactly one top-vote option with at least two priorities supporting it...
        {
            colorCode = voteResults[globalResults.firstIndex].vote.Code; // then it is a clear winner		
        }
        else if (globalResults.count === 2) // otherwise, if we have exactly two top-votes...
        {
            var option1 = voteResults[globalResults.firstIndex].vote.Code;
            var option2 = voteResults[globalResults.lastIndex].vote.Code;
            colorCode = getMiddleGround(option1, option2); // we take the middle-ground option between them
        }
    
        var color = null;
        
        // A 'color' is a general conclusion on the question posed in the article: whether we take one side, another, middle-ground or other possible option
        mongoAsync.preloads.colors.forEach(element => 
        {
            if (element.Code === colorCode)
                color = element;
        });
    
        if (color.Swap) // this means we must swap options A and B so that wrong one is always displayed on the left
        {
            var swap = article.TokenA;
            article.TokenA = article.TokenB;
            article.TokenB = swap;
    
            // order of voteResults helps client display vote results on the chart correctly,
            // so we also swap A with B and AB with BA
            var voteA;
            var voteB;
            var voteBA;
            var voteAB;
            for (let voteIndex = 0; voteIndex < voteResults.length; voteIndex++)
            {
                let res = voteResults[voteIndex];
                let vote = res.vote;
                let code = vote.Code;
                switch (code)
                {
                    case 'A': voteA = voteIndex; vote.Code = 'B'; break;
                    case 'AB': voteAB = voteIndex; vote.Code = 'BA'; break;
                    case 'BA': voteBA = voteIndex; vote.Code = 'AB'; break;
                    case 'B': voteB = voteIndex; vote.Code = 'A'; break;
                }
            }
    
            swap = voteResults[voteA];
            voteResults[voteA] = voteResults[voteB];
            voteResults[voteB] = swap;
    
            swap = voteResults[voteAB];
            voteResults[voteAB] = voteResults[voteBA];
            voteResults[voteBA] = swap;
    
            // also swap user's own vote
            switch (ownVote)
            {
                case 'A': ownVote = 'B'; break;
                case 'B': ownVote = 'A'; break;
                case 'AB': ownVote = 'BA'; break;
                case 'BA': ownVote = 'AB'; break;
            }
        }
    
        // finally, we form the client results into a single object
        var articleData = 
        {
            article : article,
            totalPopular : totalPopular,
            priorityList : priorityList,
            voteResults : voteResults,
            result : color,
            ownVote : ownVote,
        };
        return articleData;
    }