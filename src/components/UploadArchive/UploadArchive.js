import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UploadArchive.css';
import Dropzone from 'react-dropzone';
import { showSticky, getExtension } from '../../utility';

const archiveExtensions = ['zip'];

class UploadArchive extends React.Component
{
    async onDrop(acceptedFiles)
    {
        if (!acceptedFiles || !acceptedFiles.length) return;
        if (acceptedFiles.length > 1)
        {
            showSticky(this, 'Одна країна, один народ, одна мова – один файл бекапу!');
            return;
        }
        var file = acceptedFiles[0];
        var ext = getExtension(file.name);        
        if (!archiveExtensions.includes(ext))
        {
            showSticky(this, 'Неприпустимий формат архіву. Варіанти: '+archiveExtensions.join(', '));
            return;
        }
        if (file.size > 1024 * 1024 * 1024)
        {
            showSticky(this, 'Халепа. Не впевнений, що потягну понад гігабайт...');
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
                +'&totalSize='+fileAsArrayBuffer.byteLength+'&operation=backup&ext='+ext, { method: 'POST',
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
                    Перетягніть файли сюди. Припустимі формати: {archiveExtensions.join(', ')}. Максимальний розмір файлу: та вали, скільки хочеш
                </Dropzone>
        );
    }
}

export default withStyles(s)(UploadArchive);