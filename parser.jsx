

log = function (arguments) {
    $.writeln(arguments)
    // alert(arguments)
}




$.evalFile(File($.fileName).path + "/UI-DNA/DVE/bin/JSX/Enzymes_lib.jsx");
paths = File($.fileName).path + "/UI-DNA/DVE/bin";
initEnzymes(paths)

//
function logInfo(Txt, file_name) {
    var file = new File(File($.fileName).path + "/" + file_name);
    file.open("w");
    file.write(Txt);
    file.close();
}

//获取模板文件内容
function getTempelete(file_name) {
    paths = File($.fileName).path + "/" + file_name
    log(paths)
    var file = new File(paths);
    file.open("r");
    // file.seek(0, 2);
    // $.os.search(/windows/i) != -1 ? file.lineFeed = 'windows' : file.lineFeed = 'macintosh';
    temp = file.read();
    file.close();
    return temp
}

//
Parser = {}

//根据layer name获得layer对象
layers = EnzJSX.getAllLayersList(true)
Parser.getLayerByName = function (name) {
    for (var i = 0; i < layers.length; i++) {
        layer = layers[i]
        if (layer.name == name) {
            return layer
            break
        }
    }
}

//需要转译的分组信息
Parser.t_groups = [
    {
        "g_name": "组 4",
        "sub_views": []
    },
    {
        "g_name": "最新公益需求标题",
        "sub_views": ["矩形 4", "关键字、来自"]
    },
    {
        "g_name": "1",
        "sub_views": []
    }
]

//需要转译的分组
Parser.setTargetGroups = function (groups) {
    Parser.t_groups = groups
}

//子试图坐标转相对父视图
//{"x":0,"y":548,"w":750,"h":130,"right":750,"bottom":678}
Parser.convertFrame = function (sub_frame, parent_frame) {
    sub_frame_m = JSON.parse(sub_frame)
    parent_frame_m = JSON.parse(parent_frame)
    xx = sub_frame_m.x - parent_frame_m.x
    yy = sub_frame_m.y - parent_frame_m.y
    ww = sub_frame_m.w
    hh = sub_frame_m.h
    sub_frame_str = "WFCGRectMake(" + xx / 2 + "," + yy / 2 + "," + ww / 2 + "," + hh / 2 + ")"
    return sub_frame_str
}

//转译
Parser.parse = function () {
    for (var i = 0; i < Parser.t_groups.length; i++) {
        group = Parser.t_groups[i]
        dealGroup(group, i)
    }
}

//获取frame WFCGRectMake
function getFrame(frame) {
    frame_m = JSON.parse(frame)
    xx = frame_m.x
    yy = frame_m.y
    ww = frame_m.w
    hh = frame_m.h

    //frame
    frame_str = "WFCGRectMake(" + xx / 2 + "," + yy / 2 + "," + ww / 2 + "," + hh / 2 + ")"
    return frame_str
}
//获取bounds  WFCGRectMake
function getBounds(frame) {
    frame_m = JSON.parse(frame)
    xx = frame_m.x
    yy = frame_m.y
    ww = frame_m.w
    hh = frame_m.h

    //bounds
    frame_str = "WFCGRectMake(" + 0 + "," + 0 + "," + ww / 2 + "," + hh / 2 + ")"
    return frame_str
}

//获取边框圆角信息
function getBorder(layer_id) {
    l_shape_info = EnzJSX.getLayerInfo_shape_byId(layer_id)
    l_shape_info_m = JSON.parse(l_shape_info)
    log(l_shape_info)
    //背景色
    fillColor = l_shape_info_m.fillColor
    
    bgcolors = "RGBCOLOR(255,255,255,1)"
    if (fillColor.r) {
        bgcolors = "RGBCOLOR(" + fillColor.r + "," + fillColor.g + "," + fillColor.b + ",1)"
    }
    //边框颜色
    strokeColor = l_shape_info_m.strokeColor
    bordercolors = "nil"
    if (strokeColor.r) {
        bordercolors = "RGBCOLOR(" + strokeColor.r + "," + strokeColor.g + "," + strokeColor.b + ",1)"
    }
    //边框宽度
    lineWidth = l_shape_info_m.lineWidth
    borderwidth = 0
    if (lineWidth) {
        borderwidth = lineWidth
    }
    //圆角
    radian = l_shape_info_m.radian
    cordius = 0
    if (radian.topRight) {
        cordius = "WFCGFloat(" + radian.topRight / 2 + ")"
    }

    borderObj = {
        "pbackgroundColor":bgcolors,
        "pborderColor":bordercolors,
        "pborderWidth":borderwidth,
        "pcornerRadius":cordius
    }
    return borderObj
}

//获取文本信息
function getText(layer_id) {
    l_text_info = EnzJSX.getLayerInfo_text_byId(layer_id)
    l_text_info_m = JSON.parse(l_text_info)
    log(l_text_info)

    //UILable 模板
    temps = getTempelete("TextView.code")

    ///文本
    //文字
    text = l_text_info_m.text
    texts = "@\"" + text + "\""
    //文字颜色
    color = l_text_info_m.color
    
    text_color = "RGBCOLOR(35,35,35,1)"
    if (color.r) {
        text_color = "RGBCOLOR(" + color.r + "," + color.g + "," + color.b + ",1)"
    }
    //文字font
    size = l_text_info_m.size
    text_font = "SYSTEMFONT(10)"
    if (size) {
        text_font = "SYSTEMFONT(" + size / 2 + ")"
    }

    textObj = {
        "ptext":texts,
        "ptColor":text_color,
        "pfont":text_font
    }
    return textObj
}

//处理分组
function dealGroup(grou, i) {
    g_name = group.g_name
    sub_views = group.sub_views

    //分组图层的对象
    group_layer = Parser.getLayerByName(g_name)
    g_bounds_info = EnzJSX.getLayerInfo_position_byId(group_layer.id)

    //默认使用UIview模板
    temp_header = getTempelete("Header.code")
    temp_source = getTempelete("Source.code")

    //group frame
    group_frame_str = getBounds(g_bounds_info)
    //group name
    group_name = "Group" + i
    temp_header = temp_header.replace(/<CLASSNAME>/g, group_name)
    temp_source = temp_source.replace(/<CLASSNAME>/g, group_name)
    temp_source = temp_source.replace("<CLASSFRAME>", group_frame_str)

    //属性声明集
    property_decls = ""
    property_impls = ""

    for (var j = 0; j < sub_views.length; j++) {
        v_name = sub_views[j]
        layer = Parser.getLayerByName(v_name)

        l_bounds_info = EnzJSX.getLayerInfo_position_byId(layer.id)
        layer_frame = Parser.convertFrame(l_bounds_info, g_bounds_info)

        l_type = EnzJSX.getLayerType_byID(layer.id)
        l_type_name = JSON.parse(l_type).typeName
        log(l_type_name)

        //模板
        temps = ""
        //属性名
        property_name = "@property (nonatomic,strong) "

        if (l_type_name == 'shape') {
            property_name = property_name + "UIView *"
            //UIView 模板
            temps = getTempelete("View.code")
        }
        if (l_type_name == 'text') {
            property_name = property_name + "UILabel *"
            l_text_info = EnzJSX.getLayerInfo_text_byId(layer.id)
            l_text_info_m = JSON.parse(l_text_info)
            log(l_text_info)

            //UILable 模板
            temps = getTempelete("TextView.code")

            ///文本
            textObj = getText(layer.id)
            temps = temps.replace("ptext", textObj.ptext)
            temps = temps.replace("ptColor", textObj.ptColor)
            temps = temps.replace("pfont", textObj.pfont)
            temps = temps.replace("ptAlignment", "NSTextAlignmentLeft")
        }
        property_name = property_name + "view" + j
        property_decls = property_decls + property_name + "\n"


        // l_shape_info = EnzJSX.getLayerInfo_shape_byId(layer.id)
        borderObj = getBorder(layer.id)

        temps = temps.replace("pbackgroundColor", borderObj.pbackgroundColor)
        temps = temps.replace("pborderColor", borderObj.pborderColor)
        temps = temps.replace("pborderWidth", borderObj.pborderWidth)
        temps = temps.replace("pcornerRadius", borderObj.pcornerRadius)
        temps = temps.replace("pframe", layer_frame)
        temps = temps.replace(/pview/g, ("view" + j))

        property_impls = property_impls + temps + "\n"

    }
    temp_header = temp_header.replace("<Propertys>", property_decls)
    temp_source = temp_source.replace("<PropertyImplements>", property_impls)

    fileName_h = group_name + ".h"
    fileName_s = group_name + ".m"
    logInfo(temp_header, fileName_h)
    logInfo(temp_source, fileName_s)
}

Parser.parse()