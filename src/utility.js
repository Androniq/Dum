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

	['link'],
  
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

export function generateToken()
{
	var r = '';
	const arr = '0123456789abcdef';
	for (let index = 0; index < 32; index++)
	{
		r += arr[Math.floor(Math.random() * 16)];
	}
	return r;
}

export const acceptedExtensions = ['png','jpg','jpeg','tiff'];

export function getExtension(filename)
{
    filename = filename.toLowerCase();
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}

export function dateToRelative(date)
{
	if (typeof date === 'string') date = new Date(date);
	var now = new Date();
	var diff = now - date;
	if (diff === 0) return "Просто зараз!!!";
	if (diff > 0) return dateToRelativePast(diff*0.001) || date.toLocaleDateString('uk-UA');
	if (diff < 0) return dateToRelativeFuture(-diff*0.001) || date.toLocaleDateString('uk-UA');
	return "Скажіть Андронікові, що трапилась якась фігня";	
}

function dateToRelativePast(seconds)
{
	if (seconds < 60)
		return "щойно";
	if (seconds < 3600)
	{
		var minutes = Math.floor(seconds / 60);
		return minutes + ` хвилин${feminineCaseEnding(minutes)} тому`;
	}
	if (seconds < 86400)
	{
		var hours = Math.floor(seconds / 3600);
		return hours + ` год тому`;
	}
	var days = Math.floor(seconds / 86400);
	switch (days)
	{
		case 1: return "вчора";
		case 2: return "позавчора";
		case 3: return "3 дні тому";
	}
	return null;
}

function dateToRelativeFuture(seconds)
{
	if (seconds < 60)
		return "зараз";
	if (seconds < 3600)
	{
		var minutes = Math.floor(seconds / 60);
		return `через ${minutes} хвилин${feminineCaseEnding(minutes)}`;
	}
	if (seconds < 86400)
	{
		var hours = Math.floor(seconds / 3600);
		return `через ${hours} год`;
	}
	var days = Math.floor(seconds / 86400);
	switch (days)
	{
		case 1: return "завтра";
		case 2: return "післязавтра";
		case 3: return "через 3 дні";
	}
	return null;
}

function feminineCaseEnding(number)
{
	number = Math.floor(number) % 100;
	if (number >= 10 && number <= 20)
	{
		return "";
	}
	switch (number)
	{
		case 1:
			return "у";
		case 2:
		case 3:
		case 4:
			return "и";		
	}
	if (number <= 9)
		return "";
	return feminineCaseEnding(number % 10);
}

export const DEFAULT_USERPIC = "/images/no_image_available.png";

export function userRoleToLocal(role)
{
	switch (role)
	{
		case "visitor": return "Гість";
		case "member": return "Учасник";
		case "moderator": return "Модератор";
		case "admin": return "Адміністратор";
		case "owner": return "Власник сайту";
	}
	return "Гість";
}

export function isValidArgument(argument)
{
  if (!argument)
    return false;
  if (!argument.Counters)
		return true;
  for (let index = 0; index < argument.Counters.length; index++)
  {
    if (isValidArgument(argument.Counters[index]))
				return false;
  }
  return true;
}