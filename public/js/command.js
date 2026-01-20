// 이동 매핑 (주로 <button> 태그에 사용)
const list = {
  mpg: "mainpage.html",
  login: "login.html",
  event: "event.html",
  breand: "brand.html",
  QNA: "QNA.html",
  mrg: "mrg.html",
  FYS: "FYS.html",
  mypage: "mypage.html",
  Notice: "Notice.html",
  M_D: "managerD.html",
  M_AMS: "managerP.html",
  M_U : "managerU.html",
  M_NB_E : "managerNB_E.html",
  BBM : "managerBBM.html",
  M_SDN : "managerDSN.html",
};

document.addEventListener("click", (e) => {

  const target = e.target.closest("a, button");


  if (!target) {
    return;
  }


  if (target.tagName === 'A' && target.href) {
    const currentHost = window.location.hostname;
    const linkHost = target.hostname;

    
    if (linkHost && linkHost !== currentHost) {

      e.preventDefault();
      window.open(target.href, "_blank", "noopener,noreferrer");
    }
 
    return; 
  }

 
  if (target.tagName === 'BUTTON' && list[target.id]) {
    const url = list[target.id];
    

    e.preventDefault(); 
    window.location.href = url;
  }
});

function getCompareIds() {
  try { return JSON.parse(localStorage.getItem('compareIds') || '[]'); }
  catch { return []; }
}

const Ch_item = document.querySelector('.Ch_item');
