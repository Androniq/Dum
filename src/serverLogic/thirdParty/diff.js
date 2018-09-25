/*
 *
 * @(#) $Id: diff.js,v 1.5 2014/01/30 04:07:41 mlemos Exp $
 *
 */

/*jslint plusplus: true, sloppy: true, white: true */

var ML;

if(ML === undefined)
{
	ML = { };
}

if(ML.Text === undefined)
{
	ML.Text = { };
}

if(ML.Text.Diff === undefined)
{

ML.Text.Diff = function()
{
	var htmlSpecialChars = function(text)
	{
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	},

	nl2br = function(text)
	{
		return text
			.replace(/\r\n/g, "<br>")
			.replace(/\n/g, "<br>")
			.replace(/\r/g, "<br>");
	},

	splitString = function(string, separators, end, positions)
	{
		var l = string.length, split = [], p = 0, e, s;

		s = separators + end;
		while(p < l)
		{
			for(e = p; e < l; ++e)
			{
				if(s.indexOf(string[e]) !== -1)
				{
					break;
				}
			}
			while(e < l)
			{
				if(separators.indexOf(string[e]) === -1)
				{
					break;
				}
				 ++e;
			}
			split[split.length] = string.substr(p, e - p);
			positions[positions.length] = p;
			p = e;
			if(end.length)
			{
				while(p < l)
				{
					if(end.indexOf(string[p]) === -1)
					{
						break;
					}
					++p;
				}
				if(p !== e)
				{
					split[split.length] = string.substr(e, p - e);
					positions[positions.length] = e;
				}
			}
		}
		positions[positions.length] = p;
		return split;
	};

	this.error = '';
	this.insertedStyle = 'font-weight: bold';
	this.deletedStyle = 'text-decoration: line-through';

	this.diff = function(before, after, difference)
	{
		var diff, lb, la, b, a, pb, pa, posa, posb, mode, forPatch, position, length, change, patch;

		mode = (difference.mode !== undefined ? difference.mode : 'c');
		forPatch = (difference.patch !== undefined && difference.patch);
		switch(mode)
		{
			case 'c':
				break;

			case 'w':
				posb = [];
				posa = [];
				before = splitString(before, " \t", "\r\n", posb);
				after = splitString(after, " \t", "\r\n", posa);
				break;

			case 'l':
				posb = [];
				posa = [];
				before = splitString(before, "\r\n", '', posb);
				after = splitString(after, "\r\n", '', posa);
				break;

			default:
				this.error = mode + ' is not a supported more for getting the text differences';
				return false;
		}
		lb = before.length;
		la = after.length;
		diff = [];
		b = a = 0;
		while(b < lb && a < la)
		{
			for(pb = b; a < la && pb < lb && after[a] === before[pb]; ++a)
			{
				++pb;
			}
			if(pb !== b)
			{
				position = (mode === 'c'  ? b : posb[b]);
				length = (mode === 'c' ? pb - b : posb[pb] - posb[b]);
				change = {
					change: '=',
					position: position,
					length: length
				};
				if(forPatch)
				{
					if(mode === 'c')
					{
						patch = before.substr(position, length);
					}
					else
					{
						patch = before[b];
						for(++b; b < pb; ++b)
						{
							patch += before[b];
						}
					}
					change.patch = patch;
				}
				diff[diff.length] = change;
				b = pb;
			}
			if(b === lb)
			{
				break;
			}
			for(pb = b; pb < lb; ++pb)
			{
				pa = a;
				while(pa < la && after[pa] !== before[pb])
				{
					++pa;
				}
				if(pa !== la)
				{
					break;
				}
			}
			if(pb !== b)
			{
				diff[diff.length] = {
					change: '-',
					position: (mode === 'c'  ? b : posb[b]),
					length: (mode === 'c' ? pb - b : posb[pb] - posb[b])
				};
				b = pb;
			}
			if(pa !== a)
			{
				position = (mode === 'c'  ? a : posa[a]);
				length = (mode === 'c' ? pa - a : posa[pa] - posa[a]);
				change = {
					change: '+',
					position: position,
					length: length
				};
				if(forPatch)
				{
					if(mode === 'c')
					{
						patch = after.substr(position, length);
					}
					else
					{
						patch = after[a];
						for(++a; a < pa; ++a)
						{
							patch += after[a];
						}
					}
					change.patch = patch;
				}
				diff[diff.length] = change;
				a = pa;
			}
		}
		if(a < la)
		{
			position = (mode === 'c'  ? a : posa[a]);
			length = (mode === 'c' ? la - a : posa[la] - posa[a]);
			change = {
				change: '+',
				position: position,
				length: length
			};
			if(forPatch)
			{
				if(mode === 'c')
				{
					patch = after.substr(position, length);
				}
				else
				{
					patch = after[a];
					for(++a; a < la; ++a)
					{
						patch += after[a];
					}
				}
				change.patch = patch;
			}
			diff[diff.length] = change;
		}
		difference.difference = diff;
		return true;
	};

	this.formatDiffAsHtml = function(before, after, difference)
	{
		var html, insertedStyle, deletedStyle, td, d, diff;

		if(!this.diff(before, after, difference))
		{
			return false;
		}
		html = '';
		insertedStyle = (this.insertedStyle.length ? ' style="' + this.insertedStyle + '"' : '');
		deletedStyle = (this.deletedStyle.length ? ' style="' + this.deletedStyle + '"' : '');
		td = difference.difference.length;
		
		for(d = 0; d < td; ++d)
		{
			diff = difference.difference[d];
			switch(diff.change)
			{
				case '=':
					html += nl2br(htmlSpecialChars(before.substr(diff.position, diff.length)));
					break;
				case '-':
					html += '<del' + deletedStyle + '>' +  nl2br(htmlSpecialChars(before.substr(diff.position, diff.length))) + '</del>';
					break;
				case '+':
					html += '<ins' + insertedStyle + '>' +  nl2br(htmlSpecialChars(after.substr(diff.position, diff.length))) + '</ins>';
					break;
				default:
					this.error = diff.change + ' is not an expected difference change type';
					return false;
			}
		}
		difference.html = html;
		return true;
	};

	this.patch = function(before, difference, afterPatch)
	{
		var b, after, d, td, segment;

		after = '';
		b = 0;
		td = difference.length;
		for(d = 0; d < td; ++d)
		{
			segment = difference[d];
			switch(segment.change)
			{
				case '-':
					if(segment.position !== b)
					{
						this.error = 'removed segment position is ' + segment.position + ' and not ' + b + ' as expected';
						return false;
					}
					b += segment.length;
					break;

				case '+':
					after += segment.patch;
					break;

				case '=':
					if(segment.position !== b)
					{
						this.error = 'removed segment position is ' + segment.position + ' and not ' + b + ' as expected';
						return false;
					}
					b += segment.length;
					after += before.substr(segment.position, segment.length);
					break;

				default:
					this.error = segment.change + ' change type is not supported';
					return false;
			}
		}
		afterPatch.after = after;
		return true;
	};
};

}
