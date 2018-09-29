import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UploadImage.css';
import Dropzone from 'react-dropzone';
import { showSticky, getExtension, acceptedExtensions } from '../../utility';

class UploadImage extends React.Component
{   

    async onDrop(acceptedFiles)
    {
        if (!acceptedFiles || !acceptedFiles.length) return;
        if (acceptedFiles.length > 1)
        {
            showSticky(this, 'Зупиніться на чомусь одному!');
            return;
        }
        var file = acceptedFiles[0];
        var ext = getExtension(file.name);
        if (!acceptedExtensions.includes(ext))
        {
            showSticky(this, 'Неприпустимий формат зображення. Варіанти: '+acceptedExtensions.join(', '));
            return;
        }
        var reader = new FileReader();
        reader.onload = async () =>
        {
            const fileAsArrayBuffer = reader.result;
            var resp = await this.props.context.fetch('/api/upload?ext='+ext, { method: 'POST', body: fileAsArrayBuffer,
                headers: { "Content-Type": "application/octet-stream" }});
            var json = await resp.json();
            if (json.success)
            {
                this.props.context.user.photo = json.photo;
                showSticky(this, 'Завантаження успішне');
                if (this.props.onSuccess)
                    this.props.onSuccess();
                if (!process.env.IS_SERVER)
                {
                    window.location.reload();
                }
                //this.props.history.push(this.props.location.pathname);
            }
        };
        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.readAsArrayBuffer(file);
    }
    
    render()
    {
        return (
            <div>
                <Dropzone disablePreview onDrop={this.onDrop.bind(this)}>Перетягніть файли сюди</Dropzone>
            </div>
        );
    }
}

export default withStyles(s)(UploadImage);