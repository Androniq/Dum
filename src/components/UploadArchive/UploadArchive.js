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
            var resp = await this.props.context.fetch('/api/uploadBackup?ext='+ext, { method: 'POST', body: fileAsArrayBuffer,
                headers: { "Content-Type": "application/octet-stream" }});
            var rj = await resp.json();
            if (rj.success)
            {
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