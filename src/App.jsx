import React, { Fragment, useEffect } from "react";

// Redux Selector / Action
import { useDispatch } from "react-redux";

// import state selectors
import {
  setSetting
} from "./store/setting/actions";


function App({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSetting());
  }, [dispatch]);

  return (
    <>
      <div className="App">{children}</div>
    </>
  )
}

export default App
