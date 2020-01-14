import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [descriptions, setDescription] = useState("");
    const [results, setResults] = useState([]);
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
        </div>
    );
}

export default App;
