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
    try {
      dispatch(setSetting());
    } catch (err) {
      console.error("Failed to restore theme settings, continuing with defaults:", err);
    }
  }, [dispatch]);

  return (
    <>
      <div className="App">{children}</div>
    </>
  )
}

export default App
