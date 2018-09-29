import XRegExp from 'xregexp';

const letterRegex = XRegExp("\\p{L}");

export const USER_LEVEL_VISITOR = 1;
export const USER_LEVEL_MEMBER = 2;
export const USER_LEVEL_MODERATOR = 3;
export const USER_LEVEL_ADMIN = 4;
export const USER_LEVEL_OWNER = 5;

export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function getLevel(user)
{
	if (!user)
		return USER_LEVEL_VISITOR; // not logged in - visitor
	if (user.blocked || !user.confirmed)
		return USER_LEVEL_VISITOR; // email unconfirmed or user banned
	switch (user.role)
	{
		case 'member': return USER_LEVEL_MEMBER;
		case 'moderator': return USER_LEVEL_MODERATOR;
		case 'admin': return USER_LEVEL_ADMIN;
		case 'owner': return USER_LEVEL_OWNER;
	}
	return USER_LEVEL_VISITOR;
}

export function checkPrivilege(user, level)
{
	return getLevel(user) + 0.1 /* sorry, I'm C# paranoid - scary number comparison */ >= level;
}

function s4()
{
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

export function guid()
{
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

export function htmlNonEmpty(html)
{
	let tag = false;
	for (let index = 0; index < html.length; index++)
	{
		let chr = html[index];
		if (chr === '<')
			tag = true;
		if (chr === '>')
			tag = false;
		else if (!tag && letterRegex.test(chr))
			return true;
	}
	return false;
}

export const quillToolbarOptions = [
	['bold', 'italic', 'underline', 'strike'],        // toggled buttons
	['blockquote', 'code-block'],
  
	[{ 'header': 1 }, { 'header': 2 }],               // custom button values
	[{ 'list': 'ordered'}, { 'list': 'bullet' }],
	[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
	[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
	[{ 'direction': 'rtl' }],                         // text direction
  
	[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
	[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
	[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
	[{ 'font': [] }],
	[{ 'align': [] }],
  
	['clean']                                         // remove formatting button
  ];

  var currentStickyTimeout;
  var currentStickyTimeoutInner;

  export function showSticky(component, message)
  {
	  if (!component || !message)
	  {
		throw { message: "No component or no message given to showSticky method. Usage: showSticky(this, message)." };
	  }
	  if (!component.props || !component.props.context || !component.props.context.setLayoutState)
	  {
		  throw { message: "Could not bind to layout state" };
	  }
	  if (currentStickyTimeout) { clearTimeout(currentStickyTimeout); }
	  if (currentStickyTimeoutInner) { clearTimeout(currentStickyTimeoutInner); }
	  component.props.context.setLayoutState({ stickyText: message, stickyShown: 2 });
	  currentStickyTimeout = setTimeout(async function()
	  {
		  await component.props.context.setLayoutState({ stickyShown: 1 });
		  currentStickyTimeoutInner = setTimeout(
			function() { component.props.context.setLayoutState({ stickyShown: 0 }); },
			2000
		  );
	  }, 1000);
  }

  export async function totalRecall(context) // reloads current user from server session
  {
	var whoami = await context.fetch('/api/whoami', { method: 'GET' });
	if (whoami.status !== 200)
		return;
	var whoamiJson = await whoami.json();
	if (whoamiJson.status !== 200)
		return;
	context.user = whoamiJson.user;
	context.setLayoutState({dummy:Math.random()});
}