import React, { useState, useEffect } from 'react'
import './App.css'
import Post from './Post'
import {db, auth} from './firebase'
import { Button, Input, Modal } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import ImageUpload from './ImageUpload'

function rand() {
    return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }
  
  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));

const App = () =>{

    const classes = useStyles()
    const [modalStyle] = React.useState(getModalStyle);
    const [posts, setPosts] = useState([])
    const [open, setOpen] =  useState(false)
    const [openSignIn, setOpenSignIn] =  useState(false)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)

    useEffect(()=>{
        const unsubscribe=auth.onAuthStateChanged((authUser)=>{
            if(authUser){
                setUser(authUser)                
            }else{
                setUser(null)
            }
        })
        return () =>{
            unsubscribe()
        }
    },[user, username])

    useEffect(() => {
        db.collection('posts')
            .orderBy('timestamp','desc')
            .onSnapshot(snapshot =>{
            setPosts(snapshot.docs.map(doc=>({
                id: doc.id,
                post : doc.data()
            })))
        })
    },[])

    const signUp=(event)=>{
        event.preventDefault()

        auth.createUserWithEmailAndPassword(email, password)
        .then((authUser)=>{
            return authUser.user.updateProfile({
                displayName: username
            })
        })
        .catch((err)=> alert(err.message))
        setEmail('')
        setPassword('')
        setOpen(false)
    }

    const signIn = (event) =>{
        event.preventDefault()

        auth
            .signInWithEmailAndPassword(email,password)
            .catch((error)=>alert(error.message))

        setEmail('')
        setPassword('')        
        setOpenSignIn(false)

    }

    return(
        <div className='app'>        

            <Modal
                open={open}
                onClose={()=>setOpen(false)} >
                    <div style={modalStyle} className={classes.paper}>
                    <form className='app__signUp'>
                        <center>
                        <img 
                            className='app__headerImage'
                            src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
                            alt='Instagram Logo'
                        />
                        </center>
                        <Input 
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                        />
                        <Input 
                            type='email'
                            placeholder='Email'
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                        />
                        <Input 
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                        <Button type='submit' onClick={signUp} variant='contained' color='primary' >Sign Up</Button>
                        </form>
                    </div>
            </Modal>

            <Modal
                open={openSignIn}
                onClose={()=>setOpenSignIn(false)} >
                    <div style={modalStyle} className={classes.paper}>
                    <form className='app__signUp'>
                        <center>
                        <img 
                            className='app__headerImage'
                            src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
                            alt='Instagram Logo'
                        />
                        </center>                        
                        <Input 
                            type='email'
                            placeholder='Email'
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                        />
                        <Input 
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                        <Button type='submit' onClick={signIn} variant='contained' color='primary'>Log In</Button>
                        </form>
                    </div>
            </Modal>

            <div className='app__header'>
                <img 
                    className='app__headerImage'
                    src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
                    alt='Instagram Logo'
                />

            {
                user ? 
                    <Button onClick={()=>auth.signOut()} variant="contained"  color='secondary'>Log Out</Button>    
                : 
                    <div className='app__loginContainer'>
                        <Button onClick={()=>setOpenSignIn(true)} variant="contained" color='primary'>Sign In</Button>
                        <Button onClick={()=>setOpen(true)} variant="contained" color='secondary'>Sign Up</Button>
                    </div>
                    
            }
            </div>
            
            <div className='app__posts'>
            {
                posts.map(({id,post})=>(
                    <Post 
                        key={id}
                        postId={id}
                        user={user}
                        username={post.username}
                        avatar={post.avatar}
                        imageUrl={post.imageUrl}
                        caption={post.caption}
                    />
                ))
            }
            </div>    
            {
                user ?
                    <ImageUpload username={user.displayName} />
                : null
            }
                                    
        </div>
    )
}

export default App