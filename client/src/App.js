import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import ImageUploader from 'react-images-upload';

function App() {
    const [descriptions, setDescription] = useState("");
    const [results, setResults] = useState([]);
    const [picture, setPicture] = useState([]);

    const onDrop = (pic) => {
        setPicture(pic);
        console.log(pic);
        const formData = new FormData();
        formData.append('file', pic);
        formData.append('name', 'file')
        axios({
            method: 'post',
            url: "http://localhost:3000/upload",
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
            // .post("http://localhost:3000/upload", { file: pic[0] })
            .then(response => {
                console.log("response", response);
            })
            .catch(error => {
                console.log("error", error);
            });
    }

    const onUpload = event => {
        event.stopPropagation();

    }

    return (
        <div>
            <input
                className="App"
                type="text"
                placeholder="choose repository path"
                style={{ width: 200 }}
                value={descriptions}
                onChange={e => setDescription(e.target.value)}
            ></input>
            <button
                onClick={() => {
                    console.log("sending", descriptions);
                    axios
                        .post("http://localhost:3000/search", { data: { descriptions } })
                        .then(response => {
                            const { hits } = response.data.descriptions.body.hits;
                            const sources = hits.map(({ _source }) => _source.descriptions);
                            console.log("hits", sources);
                            setResults(sources);
                        })
                        .catch(error => {
                            console.log("error", error);
                        });
                }}
            >
                Send
            </button>
        {results.map(result => (<div key={result}>{result}</div>))}

        {/* <ImageUploader
            singleImage={true}
            withIcon={true}
            buttonText='Choose image'
            onChange={onDrop}
            imgExtension={['.jpg', '.gif', '.png', '.gif']}
        /> */}
        {/* <form><input type="file" /><button type="submit">Upload</button></form> */}

        <h1>Upload Image</h1>
 
         <form onSubmit={onUpload} action="http://localhost:3000/upload" method="post" enctype="multipart/form-data">
            <input type="file" accept="image/*" name="file" />
            <input type="submit" value="upload"/>
        </form>

        </div>
    );
}

export default App;
