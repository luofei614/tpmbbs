var A=AV.Object.extend('article',{
},{
    //添加文章
    add:function(title,content,cat_id,uid,username,avatar){
        var article=new A();
        return article.save({
            title:title,
            content:content,
            cat_id:cat_id,
            uid:uid,
            username:username,
            avatar:avatar
        }); 
    },
});
