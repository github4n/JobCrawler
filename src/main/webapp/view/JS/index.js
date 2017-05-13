//JQuery实现网页的动态变化
$(document).ready(function() {
	$("#savedContentTag").css('background-color', '#FFFFFF');
	$("#newContent").hide();
	loadTable();
	loadKind();
	loadDistrict();
	$("#stop").attr("disabled", true);
	$("#savedContentTag").click(function()
		{
			$("#savedContentTag").css('background-color', '#FFFFFF');
			$("#newContentTag").css('background-color', '#14B6A1');
			$("#savedContent").show();
			$("#newContent").hide();
			$(".contentTr").remove();
			loadTable();
		});
	$("#newContentTag").click(function()
		{
			$("#savedContentTag").css('background-color', '#14B6A1');
			$("#newContentTag").css('background-color', '#FFFFFF');
			$("#savedContent").hide();
			$("#newContent").show();
		});
});

//加载职业信息到数据表
function loadTable()
{
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/savedContent?t=" + Math.random(),
		dataType: "json",
		cache: false,
		success: function(data)
		{
			var json = data;
			$.each(json, function(i, n)
			{
				var next = 
					"<tr class='contentTr'><td>" + n.kind+ "</td>"
					+ "<td>" + n.workPlace+"</td>" 
					+ "<td>" + n.amount + "</td>"
					+ "<td>"
					+ "<img src='view/IMG/ico-see.png' style='width:30px;cursor:pointer' title='查看数据' onclick='displayData(\"" + n.kind + "\",\"" + n.workPlace + "\")'>"
					+ "</td>"
					+ "<td>"
					+ "<img src='view/IMG/ico-del.png' style='width:30px;cursor:pointer' title='删除数据' onclick='removeData(\"" + n.kind + "\",\"" + n.workPlace + "\")'>"
					+ "</td>"
					+ "<td>"
					+ "<img src='view/IMG/ico-report.png' style='width:30px;cursor:pointer' title='查看数据' onclick='generateReport(\"" + n.kind + "\",\"" + n.workPlace + "\")'>"
					+ "</td></tr>";
				$("#savedContent table").append(next);
			});
		}
	});
}

//获取职业类型选择框的候选数据
function loadKind()
{
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/getKind",
		dataType: "json",
		success: function(data)
		{
			$.each(data, function(index, value)
			{
				$("#sel_kind").append("<option>" + value.kind + "</option>");
			});
		}
	});
}

//获取地区选择框的候选数据
function loadDistrict()
{
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/getDistrict",
		dataType: "json",
		success: function(data)
		{
			$.each(data, function(index, value)
			{
				$("#sel_distinct").append("<option>" + value.district + "</option>");
			});
		}
	});
}

//跳转到招聘信息一览表页面
function displayData(kind, workPlace)
{
	//由于参数中可能存在url保留的关键字，比如%、#等，所以必须对参数进行url编码
	var k = encodeURIComponent(kind);
	var w = encodeURIComponent(workPlace);
	window.open("displayData?kind=" + k + "&workPlace=" + w);
}

//清空对应表单中的数据库信息
function removeData(kind, workPlace)
{
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/removeData",
		data: "kind=" + kind + "&workPlace=" + workPlace,
		success: function(data)
		{
			if(data == "true")
			{
				alert("清除数据成功！");
			}
			else
			{
				alert("清除数据失败！");
			}
			$(".contentTr").remove();
			loadTable();
		}
	});
}

//全局变量finishFlag用于记录爬虫程序是否已经结束
var finishFlag = false;

//启动后台爬虫程序
function startCrawler()
{
	var kind = $("#sel_kind option:selected").text();
	var distinct = $("#sel_distinct option:selected").text();
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/startCrawler",
		data: "kind=" + kind + "&distinct=" + distinct,
		success: function(data)
		{
			if(data == "success")
			{
				$("#start").attr("disabled", true);
				$("#stop").removeAttr("disabled");
				$("textarea").append("爬虫程序正在初始化...\n");
				finishFlag = false;
				//定时刷新textarea以显示爬虫运行状态
				var timer = window.setInterval(function(){
					getCrawlerStatus();
					if(finishFlag == true)
					{
						window.clearInterval(timer);
						$("#start").removeAttr("disabled");
						$("#stop").attr("disabled", true);
					}
				},2000);
			}
			else if(data == "failure")
			{
				alert("启动失败！" + distinct + "地区的" + kind + "招聘信息已存在。");
			}
			else
			{
				alert("error!");
			}
		}
	});
}

//获取爬虫程序的状态
function getCrawlerStatus()
{
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/getCrawlerStatus",
		dataType: "json",
		success:function(data)
		{
			$("textarea").append("已获取" + data.count + "条信息,"+ data.status + "\n");
			if(data.status == "爬虫程序已停止运行。")
			{
				finishFlag = true;
			}
			else
			{
				finishFlag = false;
			}	
		}
	});
}

//停止运行爬虫程序
function stopCrawler()
{
	$.ajax({
		type: "post",
		url: "http://localhost:8080/JobCrawler/stopCrawler",
		success: function(data)
		{
			$("textarea").append(data);
			$("#stop").attr("disabled", true);
		}
	});
}

function generateReport(kind, workPlace)
{
	//由于参数中可能存在url保留的关键字，比如%、#等，所以必须对参数进行url编码
	var k = encodeURIComponent(kind);
	var w = encodeURIComponent(workPlace);
	window.open("report?kind=" + k + "&district=" + w);
}