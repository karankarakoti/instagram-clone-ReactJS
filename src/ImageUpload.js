import { Button } from '@material-ui/core'
import React, { useState } from 'react'
import firebase,{storage, db} from './firebase'
import './ImageUpload.css'


function ImageUpload(props) {

    const [caption, setCaption] = useState('')
    const [image, setImage] = useState(null)
    const [progress, setProgress] = useState(0)

    const handleChange = (e) =>{
        if (e.target.files[0]) {
            setImage(e.target.files[0])
        }
    }

    const handleUpload = () =>{
        const uploadTask = storage.ref(`images/${image.name}`).put(image)

        uploadTask.on(
            'state_changed',
            (snapshot)=>{
                const progres = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) *100
                )
                setProgress(progres)
            },
            (err)=>{
                alert(err.message)
            },
            ()=>{
                storage
                    .ref('images')
                    .child(image.name)
                    .getDownloadURL()
                    .then(url =>{
                        db.collection('posts')
                            .add({
                                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                                caption: caption,
                                imageUrl: url,
                                username: props.username
                            })
                            setCaption('')
                            setProgress(0)
                            setImage(null)
                    })
            }
        )
    }

    return (
        <div className='imageupload'>
            <progress className='imageupload__progress' value={progress} max='100' />
            <input 
                type='text' 
                placeholder='Enter Caption...' 
                onChange={e=>setCaption(e.target.value)} 
                value={caption}                 
            />
            <input type='file' onChange={handleChange} />
            <Button onClick={handleUpload} variant='contained' color='primary'>
                Upload
            </Button>
        </div>
    )
}

export default ImageUpload
