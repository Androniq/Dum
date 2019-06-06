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
        if (file.size > 256 * 1024)
        {
            showSticky(this, 'Майте совість! База даних коштує $15 за гігабайт на місяць! Максимальний розмір аватарки – 256 КБ!');
            return;
        }
        var reader = new FileReader();
        reader.onload = async () =>
        {
            const fileAsArrayBuffer = reader.result;
            const chunkSize = 1024;
            var chunkNumber = Math.ceil(fileAsArrayBuffer.byteLength / chunkSize);
            var chunks = [];
            for (var index = 0; index < chunkNumber; index++)
            {
                chunks.push(fileAsArrayBuffer.slice(chunkSize*index, Math.min(chunkSize*(index+1), fileAsArrayBuffer.byteLength)));
            }
            var resp = await this.props.context.fetch('/api/uploadInit?chunkSize='+chunkSize+'&chunkNumber='+chunkNumber
                +'&totalSize='+fileAsArrayBuffer.byteLength+'&operation=avatar&ext='+ext, { method: 'POST',
                headers: { "Content-Type": "application/json" }});
            var json = await resp.json();
            if (json.success)
            {
                var chunkOps = [];
                for (var index = 0; index < chunkNumber; index++)
                {
                    chunkOps.push(this.props.context.fetch('/api/uploadChunk?uploadToken='+json.uploadToken+'&chunkIndex='+index, { method: 'POST', body: chunks[index],
                        headers: { "Content-Type": "application/octet-stream" }}));
                }
                
                await Promise.all(chunkOps);

                this.props.context.user.photo = json.photo;
                showSticky(this, 'Завантаження успішне');
                if (this.props.onSuccess)
                    this.props.onSuccess();
                if (!process.env.IS_SERVER)
                {
                    window.location.reload();
                }
            }
        };
        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.readAsArrayBuffer(file);
    }
    
    render()
    {
        return (
                <Dropzone className={s.dropzone} disablePreview onDrop={this.onDrop.bind(this)}>
                    Перетягніть файли сюди. Припустимі формати: {acceptedExtensions.join(', ')}. Максимальний розмір файлу: 256 КБ
                </Dropzone>
        );
    }
}

export default withStyles(s)(UploadImage);