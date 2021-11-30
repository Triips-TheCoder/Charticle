import './Profile.css'
import profileImg from '../../../src/pages/Profile/logo192.png'
import Camera from '../../components/svg/Camera'
import {useEffect, useState} from 'react'
import {ref, getDownloadURL, uploadBytes, deleteObject} from "firebase/storage"
import {STORAGE, DB, AUTH} from '../../firebase'
import {getDoc, doc, DocumentData, updateDoc} from 'firebase/firestore'

const Profile = () => {
    const [img, setImg] = useState<File | null>(null)
    const [user, setUser] = useState<DocumentData | null>(null)
    let avatar: string = ""

    useEffect(() => {
        getDoc(doc(DB, 'users', AUTH.currentUser!.uid)).then(docSnap => {
            if (docSnap.exists())
                setUser(docSnap.data())
        })

        if (img) {
            // Donne un nom unique au ficher pour ne pas l'écraser et upload le fichier dans la base de donnée.
            (async () => {
                try {
                    if (user!.avatarPath) {
                        await deleteObject(ref(STORAGE, user!.avatarPath))
                    }
                    const imgRef = ref(STORAGE, `avatar/${new Date().getTime()} - ${img.name}`)
                    const snap = await uploadBytes(imgRef, img)
                    const url = await getDownloadURL(ref(STORAGE, snap.ref.fullPath))
                    await updateDoc(doc(DB, 'users', AUTH.currentUser!.uid), {
                        avatar: url,
                        avatarPath: snap.ref.fullPath
                    })

                    setImg(null)
                } catch (err: any) {
                    console.error(err.message)
                }
            })()
        }
    }, [img])

    return user ? (
        <section className="register-login">
            <div className="profile-container">
                <div className="img-container">
                    <img src={user.avatar || profileImg} alt="avatar"/>
                    <div className="overlay">
                        <div>
                            <label htmlFor="photo">
                                <Camera/>
                            </label>
                            <input type="file" accept="image/*" style={{display: "none"}} id="photo"
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       const inputEl = e.target as HTMLInputElement
                                       setImg(inputEl.files![0])
                                   }}/>
                        </div>
                    </div>
                </div>
                <div className="text-container">
                    <h3>{user!.name}</h3>
                    <p>{user!.email}</p>
                    <hr/>
                    <small>Créer le : {user.createdAt.toDate().toDateString()}</small>
                </div>
            </div>
        </section>
    ) : null
}

export default Profile