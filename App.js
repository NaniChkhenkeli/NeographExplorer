import React from 'react';
import './App.css';
import { driver, auth } from 'neo4j-driver'; 
import MyViz from './MyViz'; 

const uri = 'neo4j://localhost:7687'; 
const user = 'neo4j'; 
const password = 'naninani'; 
const database = 'Movie'; 

const neo4jDriver = driver(uri, auth.basic(user, password), { database });

function App() {
  return (
    <div className='App'>
      <MyViz driver={neo4jDriver} />
    </div>
  );
}

export default App;
