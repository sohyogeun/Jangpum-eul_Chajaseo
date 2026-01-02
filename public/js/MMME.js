var information = [
    {id : 1, title : '회원 정보 관련', btnId : 'MMI'},
    {id : 2, title : '멤버쉽 관련', btnId : 'MMB'},
    {id : 3, title : '나의 피부 관련', btnId : 'MSK'},
    {id : 4, title : '기타 문의', btnId : 'MOI'},
]
function related(item){
    if (!item) {
        console.error("해당하는 데이터를 찾을 수 없습니다.");
        return;
    }
        var writing =
        `<div class="T_nameOne">
            <p>${item.title}</p>
                <div>
                    <select>
                        <option>내용</option>
                        <option>제목</option>
                    </select>           
                        <input type="text">         
                        <button>검색</button>           
                    </div>          
                </div>
        
                <div class="T_nameTwe">
                    <table>
                        <tbody>
                            <tr class="column">
                                <td class="T_nameTwe_One_one">V</td>
                                <td class="T_nameTwe_One_twe">번호</td>
                                <td class="T_nameTwe_One_three">제목</td>
                                <td class="T_nameTwe_One_twe">작성일</td>
                            </tr>
                            <tr>
                                <td class="T_nameTwe_One_one">
                                    <input type="checkbox">
                                </td>
                                <td class="T_nameTwe_One_twe"></td>
                                <td class="T_nameTwe_One_three"></td>
                                <td class="T_nameTwe_One_twe"></td>
                            </tr>
                        </tbody>
                    </table>
                        
                    <div class="NB_E_B">
                        <button type="button" id='${item.btnId}'>글쓰기</button>
                        <button>삭제</button>    
                    </div>
                </div> `;
                var back = document.getElementById('list-view');
                if(back) {
                    back.innerHTML = writing;
                } else {
                    console.error("에러: HTML에 id='list-view'인 태그가 없습니다.");
                }

            }

document.addEventListener('click', function(e) {
    
    var targetId = e.target.id;

    var myButtons = ['MI', 'MB', 'SK', 'OI'];

    if (myButtons.includes(targetId)) {
        
        e.preventDefault(); 

        if (targetId === 'MI') related(information.find(item => item.id === 1));
        else if (targetId === 'MB') related(information.find(item => item.id === 2));
        else if (targetId === 'SK') related(information.find(item => item.id === 3));
        else if (targetId === 'OI') related(information.find(item => item.id === 4));
    }
});