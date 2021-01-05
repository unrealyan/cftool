// import {convertBase64} from "./utils"


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

function getParameter(search) {
  const query = decodeURIComponent(search.substring(1))
  if (!query) return {}
  let vars = query.split('&')
  let queryString = {}
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=')
    // If first entry with this name
    if (typeof queryString[pair[0]] === 'undefined') {
      queryString[pair[0]] = decodeURIComponent(pair[1])
      // If second entry with this name
    } else if (typeof queryString[pair[0]] === 'string') {
      let arr = [queryString[pair[0]], decodeURIComponent(pair[1])]
      queryString[pair[0]] = arr
      // If third or later entry with this name
    } else {
      queryString[pair[0]].push(decodeURIComponent(pair[1]))
    }
  }
  return queryString
}

async function handleRequest(request) {
  if (/api\/v2\/qrcode/.test(request.url)) {
    return new Response(JSON.stringify(request))
  }

  let qrcodeId
  let queryString
  let KV_CONTENT = ''
  if (/\/[[0-9a-f]{32}/.test(request.url)) {
    let id = /\/([0-9a-f]{32})/.exec(request.url)[1]
    qrcodeId = id
    KV_CONTENT = await QRCODE.get(id)

  }
  if (/api\/v1\/qrcode\/(.*)/.test(request.url)) {
    let id = /api\/v1\/qrcode\/(.*)/.exec(request.url)[1]
    qrcodeId = await QRCODE.get(id)
  } else if (/api\/v1\/post/.test(request.url)) {
    const formData = await request.formData()
    const name = formData.get('name')
    const content = formData.get('content')
    let result = await QRCODE.put(name, content)
    return new Response(JSON.stringify({ msg: 'success', result }))
  } else if (/api\/v1\/post\/(\w*)\/?(\w*)?/.test(request.url)) {
    let req = /api\/v1\/post\/(\w*)\/?(\w*)?/.exec(request.url)
    await QRCODE.put(req[1], req[2])

    // const json = await request.json();
    // return new Response(JSON.stringify({ msg: 'success', data:json}))

    const formData = await request.formData()
    const name = formData.get('name')
    return new Response(JSON.stringify({ msg: 'success', [req[1]]: req[2], data: request.body, name }))

  } else {
    return new Response(`<html>
<head>
  <meta http-equiv='”Content-Type”' content='”text/html;' charset='utf-8″'>
  <meta name='viewport' content='width=device-width,initial-scale=1.0'>
  <link rel='stylesheet' type='text/css' href='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css'>
  <style>
    .ui.segment{
      border: none;
    }
    .preview {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 30px;
      background:linear-gradient(180deg, transparent,rgb(49, 51, 52), transparent)
    }
    .preview p {
      text-align: center;
    }
    
    div.ui.fluid.slider{
      display: flex;
    }
    
    div.ui.fluid.slider input {
      flex: 1;
    }
    
    div.btn_groups {
      display: flex;
      flex-wrap: wrap;
    }
    
    div.btn_groups .button{
      margin-top: 10px;
    }
    
    button.export{
      width: 100%;
    }
    
    #cf_alert_div{
      display: none !important;
    }
    
    
</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>
  <script 
    src='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js'></script>
  
<!--  <script src="http://html2canvas.hertzen.com/dist/html2canvas.js"></script>-->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.7/dist/html2canvas.min.js" integrity="sha256-Ax1aqtvxWBY0xWND+tPZVva/VQZy9t1Ce17ZJO+NTRc=" crossorigin="anonymous"></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js' integrity='sha512-nOQuvD9nKirvxDdvQ9OMqe2dgapbPB7vYAMrzJihw5m+aNcf0dX53m6YxM4LgA9u8e9eg9QX+/+mPu8kCNpV2A==' crossorigin='anonymous'></script>
    <script>
    
      function getColor(e){
        console.log(e.target.style)
      }
    
      function save(){
      let content = document.querySelector("#content").value
      let key = CryptoJS.MD5(content).toString();
      // console.log(key)
       const formData = new FormData()
       formData.append("name",key)
       formData.append("content",content)
      fetch("/api/v1/post",{
        method:"POST",
        body:formData
      })
      .then(res=>res.json())
      .then(res=>{
        history.pushState({name:key,content:content},"",key)
      })
      }
    </script>
</head>
<body data-content='${KV_CONTENT}' data-id='2'>
  <div id='app'>
  <div class="ui segment">
    <div class='ui grid container form'>
      <div class='row'></div>
      <div class='row'>
         <div class='column'>
        </div>
      </div>
      <div class='row'>
            <div class='column'>
                  <div class="ui fluid slider">
                    <input type="range" min="16" max="100" value="30" step='2' id='font_size'>
                    <label id='font_size_label'>30</label>
                  </div>
                  <label></label>
            </div>
      </div>
      <div class='row'>
        <div class='column color btn_groups'>
          <button class="ui red button mini">红色</button>
          <button class="ui orange button mini">橘黄色</button>
          <button class="ui yellow button mini">黄色</button>
          <button class="ui olive button mini">Olive</button>
          <button class="ui green button mini">绿色</button>
          <button class="ui teal button mini">Teal</button>
          <button class="ui blue button mini">蓝色</button>
          <button class="ui violet button mini">紫罗兰色</button>
          <button class="ui purple button mini">紫色</button>
          <button class="ui pink button mini">粉色</button>
          <button class="ui brown button mini">褐色</button>
          <button class="ui grey button mini">灰色</button>
          <button class="ui black button mini">Black</button>
        </div>
      </div>
      <div class='row'>
        <div class='column'>
          <div class='ui input fluid'>
            <textarea name='content' id='content' cols='30' rows='5' style="resize: none;">${KV_CONTENT}</textarea>
          </div>
        </div>
      </div>
      <div class='row'>
          <div class='column'>
            <div class='preview'></div>
          </div>
      </div>
      <div class='row'>
          <div class='column'>
            <button class='ui blue button export' >Export</button>
          </div>
      </div>
    </div>
    </div>
    </div>
  <script>
    let preview = $(".preview")
    let pre_width = preview.css("width").match(/\\d+/)[0];
    let pre_height = pre_width * 9 / 16;
    preview.css({height:pre_height})
  
    $("#font_size").bind("change",function(){
      console.log($(this))
      $("#font_size_label").text($(this).val())
      $(".preview p").css({"font-size":$(this).val()+"px"})
    })
  
  
    document.querySelector("#content").addEventListener("keyup",e=>{
      let content = document.querySelector("#content").value
      let preview = document.querySelector(".preview");
      preview.innerHTML='<p style=\"font-size:'+$("#font_size").val()+'px;\">'+content.replace(/(\\r|\\n|\\t)/g,"<br>")+'</p>'
      console.log(content)
       // history.pushState("","","/api/v2?b="+CryptoJS.MD5(content).toString())   
    })
  
    $(".color .button.mini").bind("click",function(){
      let color = $( this ).css( "background-color" );
      console.log(color)
      // $(".preview").css({"background":"radial-gradient(ellipse,"+color+")"})
      preview.css({"background":"radial-gradient(ellipse, "+color+", #fff)"});
    })
    
    $('.export.button').bind("click",function(){
      $('.ui.segment').addClass("loading")
       window.scrollTo(0,0); 
      html2canvas($(".preview")[0],{scale:8,backgroundColor:"null"}).then(function(canvas) {
          // document.body.appendChild(canvas);
          let fileName = "image"
          const link = document.createElement('a');
          link.download = fileName + '.png';
          canvas.toBlob(function(blob) {
            link.href = URL.createObjectURL(blob);
            link.click();
             $('.ui.segment').removeClass("loading")
          });
      });
     // window.location.href = 'data:application/octet-stream;base64,' + $("canvas")[0].toDataURL("image/jpeg");
    })
  </script>
</body>
</html>`, {
      headers: { 'content-type': 'text/html;charset=utf-8' },
    })
  }


}
