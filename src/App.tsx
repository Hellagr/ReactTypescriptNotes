import React from 'react';
import './App.css';
import { useState } from 'react';
import DataLogic from './components/dataLogic';


function App() {

  const [currentValue, setCurrentValue] = useState<string>("");
  const [dataBase, setDataBase] = useState<{ text: string, id: number }[]>([]);


  return (
    <DataLogic currentValue={currentValue} setCurrentValue={setCurrentValue} dataBase={dataBase} setDataBase={setDataBase} />
  );
}

export default App;


