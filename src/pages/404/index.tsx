import styles from "./index.less";
import { history } from "umi";
import React from 'react';


const _404:React.FC = ()=>{
  const goBack = ():void => {
      history.push("/")
  }
  return <div className={styles.notFind}>
    <img src={require("@/assets/img/404.png")} alt="" />
    <span className={styles.tip}>Your page was robbed by other public chains～</span>
    <span className={styles.back} onClick={goBack}>
        Return to info page
      </span>
  </div>
}
export default _404;
