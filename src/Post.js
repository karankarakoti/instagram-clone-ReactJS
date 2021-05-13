import React,{useState, useEffect} from 'react'
import Avatar from '@material-ui/core/Avatar'
import './Post.css'
import firebase,{ db } from './firebase'

const Post = ({postId,user,username,avatar,imageUrl,caption}) =>{

    const [comment, setComment] = useState('')
    const [comments, setComments] = useState([])

    const postComment = (e) =>{
        e.preventDefault()
        db.collection('posts')
            .doc(postId)
            .collection('comments')
            .add({
                text:comment,
                username:user.displayName,
                timestamp:firebase.firestore.Timestamp.fromDate(new Date()),
            })
            setComment('')
    }

    useEffect(() => {
        let unsubscribe;
        if(postId){
            unsubscribe = db.collection('posts')
                            .doc(postId)
                            .collection('comments')
                            .orderBy('timestamp','desc')
                            .onSnapshot((snapshot)=>{
                                setComments(snapshot.docs.map(
                                    (doc)=>doc.data()
                                ))
                            })
        }
        return () =>{
            unsubscribe()
        }
    }, [postId])

    return(
        <div className='post'>
            <div className='post__header'>
                <Avatar 
                    className='post__avatar'
                    alt='username'
                    src={avatar}
                />
                <h3>{username}</h3>
            </div>
            <img
                className='post__image'
                src={imageUrl}
                alt='Post Image'
            />
            <h4 className='post__text'><strong>{username} : </strong> {caption}</h4>

            <div className='post__comments'>
                {
                    comments.map((cmnt)=>(
                        <p>
                            <b>{cmnt.username} - </b>  {cmnt.text}
                        </p>
                    ))
                }
            </div>
            {
                user ?
                <form className='post__commentBox'>
                <input
                    className='post__input'
                    type='text'
                    placeholder='Add a comment..'
                    value={comment}
                    onChange={(e)=> setComment(e.target.value)}
                />
                <button
                    disabled={!comment}
                    className="post__button"
                    type='submit'
                    onClick={postComment}
                >Post</button>
                </form>
                : null

            }
            
        </div>
    )
}

export default Post