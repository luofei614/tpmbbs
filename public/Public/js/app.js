$(function(){
     window.is_login=false;
    $('#userinfo').html($('#userinfo_unlogin_tpl').html());
    //接受用户登陆信息
    $(window).on('message.userinfo',function(e){
        var data=e.originalEvent.data;
        if('object'==$.type(data) && data.token){
            get_user_info(data.token,function(d){
             window.U=d; //存储用户信息
             window.is_login=true;
             //储存用户信息到localStorage
             var nowtime=new Date();
             d.login_time=nowtime.Format("yyyy-MM-dd HH:mm:ss");
             localStorage.setItem('userdata',JSON.stringify(d));
             login_set();
            });         
        }
    });

    if(userdata=localStorage.getItem('userdata')){
        var userdata=JSON.parse(userdata); 
        var login_time=StringToDate(userdata.login_time);
        if(login_time.DateDiff('n',new Date())>30){
            loginout();
        }else{
            window.U=userdata; 
            window.is_login=true;
            login_set();
        }
    }
 
    
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

function login_set(){
     var userinfo_html=TPM.parseTpl($('#userinfo_tpl').html(),{avatar:U.profileImageUrl,username:U.screenName});
     $('#userinfo').html(userinfo_html);
}

function loginout(){
    localStorage.removeItem('userdata');
    window.is_login=false;
    window.U='';
    $('#userinfo').html($('#userinfo_unlogin_tpl').html());
}

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
function edit(id){
     if(!is_login){
        tpm_alert('请先登录');
        return ;
    }
     //读取文章内容
    A.find(id).then(function(d){
        if(d.uid!=U.mediaUserID){
            tpm_alert('您没有权限编辑此文章');
            return ;
        }
        var html=TPM.parseTpl($('#edit_tpl').html(),{cats:cats,data:d});
        tpm_popurl(html,null,'修改文章');
    },function(error){
        console.log(error);
        tpm_alert('获得文章失败');
    });
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



//显示文章列表
function show_article_list(cat_id,page){
    $('#cat').find('.active').removeClass('active')
    $('#cat_'+cat_id).addClass('active');
    A.list(cat_id,page).then(function(d){
        var totalPages=d.totalPages;
        var page=d.page;
        //渲染模板
        var tpl_content=$('#article_list_tpl').html();
        var html=TPM.parseTpl(tpl_content,{lists:d.lists});
        if(page<=1){
            $('#article_list').html(html); 
        }else{
            $('#article_list').append(html);
        }
        //判断是否显示加载更多按钮
        if(page<totalPages){
            //TODO加入分页按钮
            $('#article_more').data('page',page+1);
            $('#article_more').data('cat_id',cat_id);
        }else{
            $('#article_more').remove();
        }

    },function(error){
        console.log(error)
        tpm_alert('获得文章列表失败');
    });
}

function show_article_list_and_swipe(cat_id,page){
    show_article_list(cat_id,page);
    if(Modernizr.mq('(max-width:600px)')){
        $('#menubar').trigger('swipeLeft');
    }
}


//显示某一篇文章
function show_article(id){
    $('#article_list').find('li').removeClass('active'); 
    $('#li_'+id).addClass('active');
    A.find(id).then(function(d){
        var html=TPM.parseTpl($('#content_tpl').html(),{id:d.id,title:d.title,content:d.content,uid:d.uid,username:d.username,avatar:d.avatar,datetime:d.createdAt.Format('yyyy-MM-dd')});
        $('#content').html(html);
    },function(){
        tpm_alert('文章获取失败');
    })
}

function show_article_and_swipe(id){
    show_article(id);
    if(Modernizr.mq('(max-width:600px)')){
        $('#sidebar').trigger('swipeLeft');
    }

}


//删除文章
function delete_article(id){
    A.del(id).then(function(){
       //TODO 刷新列表 
    },function(){
        tpm_alert('删除失败')  
    });
}
