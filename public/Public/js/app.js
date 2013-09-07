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