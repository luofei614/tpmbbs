$(function(){
     window.is_login=false;
    //接受用户登陆信息
    $(window).on('message.userinfo',function(e){
        var data=e.originalEvent.data;
        if('object'==$.type(data) && data.token){
            get_user_info(data.token,function(d){
             window.U=d; //存储用户信息
             window.is_login=true;
             var userinfo_html=TPM.parseTpl($('#userinfo_tpl').html(),{avatar:U.profileImageUrl,username:U.screenName});
             $('#userinfo').html(userinfo_html);
            });         
        }
    });
 
    
    //显示分类
    var cat_html=TPM.parseTpl($('#cat_tpl').html(),{cats:cats});
    $('#cat').html(cat_html);

     //分析hash, 获得文章分类和文章ID  
     var cat_id,article_id;
     if(location.hash.indexOf('_')){
        var hash=location.hash.substr(1).split('_');
        cat_id=hash[0];
        article_id=hash[1];
     }
     var cat_id=cat_id || default_cat_id;
     show_article_list(cat_id);

     if(article_id){
         show_article(article_id); 
         //如果是手机访问，则隐藏侧栏
         if(Modernizr.mq('(max-width:600px)')){
            $('#menubar,#sidebar').addClass('movetoleft')
         } 
     }

     //监听分页
     $('#article_more').on('click',function(){
        var cat_id=$(this).data('cat_id');
        var page=$(this).data('page');
        show_article_list(cat_id,page);
     });
     //监听滑动
      $('#menubar,#sidebar').on('swipeLeft',function(){
         if(Modernizr.mq("(max-width:600px)")){
           $(this).addClass('movetoleft');
          }
      }); 
      $('#sidebar').on('swipeRight',function(){
         if(Modernizr.mq("(max-width:600px)")){
            $('#menubar').removeClass('movetoleft'); 
           }
      });
      $('#content').on('swipeRight',function(){
         if(Modernizr.mq("(max-width:600px)")){
            $('#sidebar').removeClass('movetoleft');    
          }
      });

  
});


//绑定账户
function login(platform){
       tpm_popurl('http://open.denglu.cc/transfer/'+platform+'?appid=6914dengeKU1ETIll7NeIKI7vaxrk6',null,'账号登陆');
}


//发布文章的弹出框

function publish(){
    if(!is_login){
        tpm_alert('请先登录');
        return ;
    }
    var html=TPM.parseTpl($('#publish_tpl').html(),{cats:cats});
    tpm_popurl(html,null,'发帖');
}

function add_article(){
        var title=$('#add_article_form').find('input[name="title"]').val();
        var content=$('#add_article_form').find('textarea[name="content"]').val();
        var cat_id=$('#add_article_form').find('select[name="cat_id"]').val();
        var username=U.screenName;
        var avatar=U.profileImageUrl;
        var uid=U.mediaUserID;     
        A.add(title,content,cat_id,uid,username,avatar).then(function(){
            tpm_info('发布成功');
            tpm_close_float_box();
            show_article_list(cat_id);            
        },function(error){
            console.log(error);
            tpm_alert('文章发布失败');
        });
        
}

//TODO 编辑文章
function edit(){

}

//获得用户信息

function get_user_info(token,cb){
    $.get('http://avosbbs.sinaapp.com/userinfo.php?token='+token,function(d){
       try{
       var obj=$.parseJSON(d);     
       }catch(e){
         tpm_alert('读取用户信息失败');
         return ;
       }
       cb(obj);
     }).fail(function(){
        tpm_alert('网络有问题，读取用户信息失败');
     });
}
