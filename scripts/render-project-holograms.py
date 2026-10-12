"""Draw precise schematic geometry and encode one transparent frame at a time."""
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, _webp

root = Path(__file__).resolve().parent.parent
projects = json.loads((root / '.artifacts/source-review/catalogue.json').read_text(encoding='utf-8'))
width, height, fps, step_seconds = 1920, 1200, 8, 2
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 48)
small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 30)
blue, pale = (35, 192, 255, 255), (145, 241, 255, 255)

def line(draw, points, fill=blue, size=5):
    draw.line(points, fill=fill, width=size, joint='curve')

def cube(draw, x, y, size, color, divisions=4):
    a, b, c = (x-size, y-size*.45), (x, y-size*.95), (x+size, y-size*.45)
    d, e, f = (x+size, y+size*.5), (x, y+size), (x-size, y+size*.5)
    draw.polygon([a,b,c,(x,y)], fill=(*color[:3],30))
    draw.polygon([a,(x,y),e,f], fill=(*color[:3],18))
    draw.polygon([(x,y),c,d,e], fill=(*color[:3],40))
    line(draw,[a,b,c,d,e,f,a],color)
    line(draw,[a,(x,y),c],color);line(draw,[(x,y),e],color)
    for i in range(1,divisions):
        t=i/divisions
        line(draw,[(a[0]+size*t,a[1]+size*.45*t),(f[0]+size*t,f[1]+size*.5*t)],(*color[:3],130),2)
        line(draw,[(x+size*t,y-size*.45*t),(x+size*t,y+size-size*.5*t)],(*color[:3],130),2)
        line(draw,[(a[0],a[1]+size*.95*t),(x,y+size*t),(c[0],c[1]+size*.95*t)],(*color[:3],130),2)

def sphere(draw,x,y,color):
    for angle in [-.8,-.4,0,.4,.8]:
        r=max(8,104*math.sqrt(1-angle*angle))
        draw.ellipse((x-r,y+angle*104-14,x+r,y+angle*104+14),outline=color,width=3)
    for scale in [.25,.55,1]:
        draw.ellipse((x-104*scale,y-104,x+104*scale,y+104),outline=color,width=3)
    for j in range(38):
        t=j*2.4;r=94*math.sqrt(j/38)
        px,py=x+math.cos(t)*r,y+math.sin(t)*r
        draw.ellipse((px-3,py-3,px+3,py+3),fill=pale)

def icon(draw,text,x,y,color,project,phase,index):
    key=text.lower()
    if any(t in key for t in ['agent','llm','meaning','classify','cnn','train','evaluate','select','quantize','retrieve']):
        sphere(draw,x,y,color)
    elif 'phone' in key:
        draw.rounded_rectangle((x-70,y-120,x+70,y+120),radius=18,outline=color,width=5)
        line(draw,[(x-22,y-100),(x+22,y-100)],color,3)
        for i in range(14):
            bar=18+30*abs(math.sin(i*.7+phase*5))
            line(draw,[(x-48+i*7,y-bar),(x-48+i*7,y+bar)],color,4)
    elif any(t in key for t in ['grid','environment','crop','image','mask']):
        corners=[(x-115,y-70),(x+55,y-110),(x+120,y+65),(x-55,y+108)]
        draw.polygon(corners,fill=(*color[:3],20));line(draw,corners+[corners[0]],color)
        for i in range(1,6):
            t=i/6
            a=(corners[0][0]+170*t,corners[0][1]-40*t)
            b=(corners[3][0]+175*t,corners[3][1]-43*t)
            line(draw,[a,b],color,2)
            a=(corners[0][0]+60*t,corners[0][1]+178*t)
            b=(corners[1][0]+65*t,corners[1][1]+175*t)
            line(draw,[a,b],color,2)
        if project=='image-privacy' and key=='mask':
            draw.rectangle((x-30,y-25,x+30,y+20),fill=blue)
    elif any(t in key for t in ['tensor','layer','weights','candidates','backend','api','workspace','hardware','sensor','motor']):
        cube(draw,x,y,100,color,6 if 'tensor' in key or 'weights' in key else 3)
    elif any(t in key for t in ['approval','validate','compatibility','decision']):
        line(draw,[(x,y-100),(x+95,y),(x,y+100),(x-95,y),(x,y-100)],color)
        line(draw,[(x-35,y),(x-5,y+28),(x+47,y-35)],color,7)
    else:
        for depth in [18,9,0]:
            draw.rounded_rectangle((x-90+depth,y-104-depth,x+90+depth,y+104-depth),radius=7,outline=(*color[:3],180 if depth else color[3]),width=3)
        for j in range(5):
            line(draw,[(x-64,y-65+j*31),(x+55-(j%2)*20,y-65+j*31)],color,3)

def render(project,seconds):
    image=Image.new('RGBA',(width,height));draw=ImageDraw.Draw(image)
    stage=min(4,int(seconds/step_seconds));phase=(seconds%step_seconds)/step_seconds
    positions=[(210+i*375,580+([0,-40,0,40,0][i] if project['id'] in ['agentic-rag','tensor-tree','tokenization'] else 0)) for i in range(5)]
    for i in range(4):
        x1,y1=positions[i];x2,y2=positions[i+1]
        route=[(x1+125,y1),(x2-140,y2)]
        color=pale if i==stage-1 else (*blue[:3],135)
        line(draw,route,color,6 if i==stage-1 else 3)
        draw.polygon([(x2-128,y2),(x2-146,y2-10),(x2-146,y2+10)],fill=color)
        if i==stage-1:
            t=min(1,phase*1.25);px=x1+125+(x2-265-x1)*t;py=y1+(y2-y1)*t
            draw.ellipse((px-7,py-7,px+7,py+7),fill=pale)
    for i,(x,y) in enumerate(positions):
        color=pale if i==stage else (*blue[:3],210 if i<stage else 155)
        icon(draw,project['nodes'][i],x,y,color,project['id'],phase,i)
        words=project['nodes'][i].split(' ');lines=['']
        for word in words:
            if draw.textlength(lines[-1]+word,font=font)>320:lines.append('')
            lines[-1]+=word+' '
        for j,text in enumerate(lines):draw.text((x,y+150+j*55),text.strip(),font=font,fill=color,anchor='mt')
    if project['id']=='finance':
        draw.rounded_rectangle((1640,380,1840,825),radius=18,outline=(*blue[:3],160),width=2)
        draw.text((1740,865),'READ-ONLY AI',font=small,fill=pale,anchor='mt')
    # Blur a small light field, then composite crisp geometry over the recorded glow.
    glow=image.resize((480,300),Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(3)).resize((width,height),Image.Resampling.BILINEAR)
    halo=image.filter(ImageFilter.GaussianBlur(4))
    return Image.alpha_composite(Image.alpha_composite(glow,halo),image)

for project in projects:
    if project['id']=='thursday':continue
    folder=root/'assets/hologram'/project['id'];folder.mkdir(parents=True,exist_ok=True)
    encoder=_webp.WebPAnimEncoder((width,height),0,0,False,3,5,False,False)
    count=5*step_seconds*fps
    for i in range(count):
        frame=render(project,i/fps)
        encoder.add(frame.getim(),round(i*1000/fps),False,92,100,0)
    encoder.add(None,count*1000//fps,False,92,100,0)
    (folder/'thursday-mail.webp').write_bytes(encoder.assemble('','',''))
    render(project,4*step_seconds+.6).save(folder/'poster.png')
    times=[]
    with Image.open(folder/'thursday-mail.webp') as clip:
        for i in range(clip.n_frames):
            clip.seek(i);clip.load();times.append(clip.info['timestamp'])
    (folder/'manifest.json').write_text(json.dumps({'width':width,'height':height,'fps':fps,'stepSeconds':step_seconds,'count':len(times),'frameTimes':times,'steps':project['steps'],'provenance':'Authored schematic geometry rendered offline; synthetic, no project execution.'},indent=2),encoding='utf-8')
    print(project['id'],len(times),(folder/'thursday-mail.webp').stat().st_size,flush=True)
