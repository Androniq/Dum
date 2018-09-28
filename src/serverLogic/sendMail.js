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

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default function sendMail(to, subject, message, html)
{
    sendMailGrid(to, subject, message, html)
}

function sendMailGrid(to, subject, message, html)
{
    const msg = {
        to,
        from: '"ДУМ" <admin@dum-grammar.com>',
        subject,
        text: message,
        html
    };
    sgMail.send(msg);
}

function sendMailRelay(to, subject, message, html)
{
    var port = parseInt(process.env.SMTP_PORT);
    var transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth:
        {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PATH
        }
    });
    transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASS // generated ethereal password
        }
    });
    var mailOptions =
    {
        from: '"ДУМ" <admin@dum-grammar.com>',
        to,
        subject,
        text: message,
        html
    };
    transport.sendMail(mailOptions, (error, info) =>
    {
        if (error)
        {
            console.error(error);
        }
        if (info)
        {
            console.info(info);
        }
    });
}