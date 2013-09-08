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
    //更新文章
    update:function(id,title,content,cat_id,uid,username,avatar){
        var article=new A();
        article.id=id;
        return article.save({
            title:title,
            content:content,
            cat_id:cat_id,
            uid:uid,
            username:username,
            avatar:avatar
        }); 
    },
    //获得文章列表
    list:function(cat_id,page,pagesize){
        var d=$.Deferred();
        page=page || 1; 
        if(page<1) page=1;
        pagesize =pagesize || 20;
        var totalPages=0;
        var query=new AV.Query('article');
        query.equalTo("cat_id",cat_id);
        var count=query.count().then(function(count){
            totalPages=Math.ceil(count/pagesize); 
            if(page>totalPages) page=totalPages;
            var skip=(page-1)*pagesize;
            query.skip(skip);
            query.limit(pagesize);
            return query.find();
        }).then(function(articles){
           var lists=[];
           for(k in articles){
               lists.push({
                 id:articles[k].id,
                 title:articles[k].get('title'),
                 username:articles[k].get('username'),
                 uid:articles[k].get('uid'),
                 cat_id:articles[k].get('cat_id'),
                 content:articles[k].get('content').substr(0,20),
                 avatar:articles[k].get('avatar'),
                 createdAt:articles[k].createdAt
               });
           } 
           d.resolve({totalPages:totalPages,page:page,lists:lists});
        },function(error){
            //error
            d.reject(error);
        });

        return d.promise();
    },
    //获得某一篇文章
    find:function(id){
        var d=$.Deferred();
        var query=new AV.Query('article');
        query.get(id).then(function(article){
            var ret={
                id:article.id,
                title:article.get('title'),
                content:article.get('content'),
                cat_id:article.get('cat_id'),
                uid:article.get('uid'),
                username:article.get('username'),
                avatar:article.get('avatar'),
                createdAt:article.createdAt
            }
            d.resolve(ret);
        },function(error){
            d.reject(error); 
        });
        return d.promise();
    },
    //删除文章
    del:function(id){
        var article=new A();
        article.id=id;
        return article.destroy();
    }
});
