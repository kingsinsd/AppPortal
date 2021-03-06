newsApp.controller("newsMoreAppCtrl", function($scope, $http, NewsService) {

    var getNewsList = function(type){
        NewsService.sendGetRequest('/api/news/' + type + '?size=200', function(response){
            console.log('result:' + ':' + response);
            $scope.newsList = response;
            $scope.curNewList = $scope.newsList.slice(0, 20);
        });
    };

    var type = NewsService.getUrlParamsString('type');
    if(type && type.length > 0){
        getNewsList(type);
    } else{
        getNewsList(1);
    }

    $scope.pageClick = function(pageNo){
        $scope.curNewList = $scope.newsList.slice((pageNo - 1) * 20, pageNo * 20);
        var str;
        for(var i = 0, j = $(".pagination li").length; i < j; i++){
            str = '.pagination li:eq(' + i +')';
            $(str).removeClass("active");


        }
        str = '.pagination li:eq(' + pageNo +')';
        $(str).addClass("active");
    };

    $scope.newsClick = function(id){
        //window.open('http://localhost:63342/AppPortal/pages/portal/news_detail.html?id=' + id);
        window.open('/pages/portal/news_detail.html?id=' + id);
    };
});