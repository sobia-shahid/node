(this["webpackJsonpvuexy-react-admin-dashboard"]=this["webpackJsonpvuexy-react-admin-dashboard"]||[]).push([[17],{1328:function(e,a,t){"use strict";t.r(a),t.d(a,"default",(function(){return T}));var r=t(80),l=t(25),n=t(0),o=t.n(n),i=t(50),c=t(586),s=t(28),m=t.n(s),u=t(356),d=(t(749),t(1334)),p=t(628),b=t(236),E=t(157),h=t(199),f=t(198),g=t(235),v=t(156),N=t(1304),x=t(1297),j=t(1298),y=t(1310),O=t(1299),C=t(1300),w=t(1303),q=t(648),k=q.a({clientName:q.c().required("Client name is required").min(7,"Too Short!").max(25,"Too Long!"),email:q.c().required("Email is required").email("Email should have proper format"),notes:q.c().required("Notes is required").min(10,"Too Short!").max(500,"Too Long!")});q.a({email:q.c().required("Email is required").email("Email must have proper format"),password:q.c().required("Password is required").min(6,"Too Short!").max(25,"Too Long!"),username:q.c().required("Username is required").min(5,"Too Short!").max(10,"Too Long!"),name:q.c(),bio:q.c(),website:q.c(),twitter:q.c(),facebook:q.c(),google:q.c(),linkid:q.c(),instagram:q.c()});function T(){var e=Object(n.useState)(!1),a=Object(l.a)(e,2),t=(a[0],a[1]),s=Object(i.f)();return o.a.createElement(o.a.Fragment,null,o.a.createElement(c.a,{breadCrumbTitle:"Contact us",breadCrumbParent:"Dashboard",breadCrumbActive:"Contact us"}),o.a.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"20px"}},o.a.createElement("div",null,o.a.createElement(N.a,{className:"p-3"},o.a.createElement(x.a,null,o.a.createElement(j.a,{sm:"12"},o.a.createElement(p.c,{initialValues:{clientName:"",email:"",notes:""},validationSchema:k,onSubmit:function(e,a){var r,l,n;console.log("clicked"),console.log(e),r=e.clientName,l=e.email,n=e.notes,t(!0),m.a.post("".concat(u.a,"/sendemail"),{clientName:r,email:l,notes:n,subject:"Customer query, from contact form"}).then((function(e){console.log(e),t(!1)})).catch((function(e){console.log(e)}))}},(function(e){var a,t,l;return o.a.createElement(d.a,null,o.a.createElement(y.a,null,o.a.createElement(x.a,null,o.a.createElement(j.a,{className:"pl-0 pr-0 mt-2"},o.a.createElement(O.a,{className:"has-icon-left form-label-group position-relative"},o.a.createElement(p.a,(a={className:"input",style:{border:"1px solid black"}},Object(r.a)(a,"className","form-control"),Object(r.a)(a,"maxLength",20),Object(r.a)(a,"required",!0),Object(r.a)(a,"type","text"),Object(r.a)(a,"placeholder","YOUR NAME"),Object(r.a)(a,"onChange",e.handleChange("clientName")),Object(r.a)(a,"value",e.values.clientName),Object(r.a)(a,"onBlur",e.handleBlur("clientName")),a)),o.a.createElement("div",{className:"form-control-position"},o.a.createElement(b.a,{size:20})),o.a.createElement(C.a,{for:"title"},"NAME"),o.a.createElement("div",{style:{color:"red",fontSize:"10px",marginTop:"5px"}},e.touched.clientName&&e.errors.clientName)))),o.a.createElement(x.a,null,o.a.createElement(j.a,{className:"pl-0 pr-0 mt-2"},o.a.createElement(O.a,{className:"has-icon-left form-label-group position-relative"},o.a.createElement(p.a,(t={className:"input",style:{border:"1px solid black"}},Object(r.a)(t,"className","form-control"),Object(r.a)(t,"required",!0),Object(r.a)(t,"type","email"),Object(r.a)(t,"placeholder","elias@hotamil.com"),Object(r.a)(t,"onChange",e.handleChange("email")),Object(r.a)(t,"value",e.values.email),Object(r.a)(t,"onBlur",e.handleBlur("email")),t)),o.a.createElement("div",{className:"form-control-position"},o.a.createElement(E.a,{size:20})),o.a.createElement(C.a,{for:"title"},"EMAIL"),o.a.createElement("div",{style:{color:"red",fontSize:"10px",marginTop:"5px"}},e.touched.email&&e.errors.email)))),o.a.createElement(x.a,null,o.a.createElement(j.a,{className:"pl-0 pr-0 mt-2"},o.a.createElement(O.a,{className:"has-icon-left form-label-group position-relative"},o.a.createElement(w.a,(l={name:"title",type:"textarea",rows:"5",id:"nameFloatingIcons",placeholder:"How to create 360 tour"},Object(r.a)(l,"rows","2"),Object(r.a)(l,"value",e.values.notes),Object(r.a)(l,"onChange",e.handleChange("notes")),Object(r.a)(l,"onBlur",e.handleBlur("notes")),Object(r.a)(l,"style",{border:"1px solid black"}),l)),o.a.createElement("div",{className:"form-control-position"},o.a.createElement(h.a,{size:20})),o.a.createElement(C.a,{for:"title"},"Title"),o.a.createElement("div",{style:{color:"red",fontSize:"10px",marginTop:"5px"}},e.touched.notes&&e.errors.notes)))),o.a.createElement(x.a,null,o.a.createElement(j.a,{className:"pl-0 pr-0 mt-2"},o.a.createElement("button",{className:"mr-1 mb-1 bg-gradient-primary",style:{width:"100%",border:"none",backgroundColor:"#0ca8fd",color:"white",bottom:"0px",padding:"15px 10px",zIndex:"4",left:"1rem",borderRadius:"5px",outline:"none"},size:"lg",onClick:e.handleSubmit},o.a.createElement("h5",{style:{color:"white",margin:"0 auto"}},"SEND"))))))})))))),o.a.createElement("div",null,o.a.createElement(N.a,{className:"p-4"},o.a.createElement("h1",{className:"mb-2",style:{textTransform:"uppercase",color:"#0ca8fd"}},"Need support"," "),o.a.createElement("hr",null),o.a.createElement("p",{className:"mt-2 mb-5"},"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent euismod quis massa at rutrum. Vivamus maximus velit id ex tempor euismod. Vivamus ac odio efficitur, placerat odio eu, tempus tortor. Vestibulum condimentum lobortis nisi, a semper ante ullamcorper quis. Nam porta tincidunt dignissim. Proin vehicula dui non pharetra laoreet. Donec eget egestas felis. Donec facilisis lacus vitae purus pulvinar, venenatis gravida dolor aliquam. Praesent turpis ipsum, blandit vel feugiat at, egestas id neque. Vivamus ultrices sem sit amet nisl ultricies, tempus pretium erat lobortis. Duis in mauris id nisl posuere tristique eget eget felis."),o.a.createElement("div",{style:{display:"grid",gridTemplateColumns:"10% 10% 10%",justifyItems:"start"}},o.a.createElement("div",{style:{cursor:"pointer"},onClick:function(e){e.preventDefault(),window.location.href="https://www.facebook.com/Walkin360-105284791026132"}},o.a.createElement(f.a,{size:30,color:"#0ca8fd"})),o.a.createElement("div",{style:{cursor:"pointer"},onClick:function(e){e.preventDefault(),window.location.href="https://twitter.com/"}},o.a.createElement(g.a,{size:30,color:"#0ca8fd"})),o.a.createElement("div",{style:{cursor:"pointer"},onClick:function(){return s.push("/faq")}},o.a.createElement(v.a,{size:30,color:"#0ca8fd"})))))))}},586:function(e,a,t){"use strict";var r=t(11),l=t(12),n=t(13),o=t(14),i=t(0),c=t.n(i),s=t(1315),m=t(1316),u=t(153),d=t(30),p=function(e){Object(n.a)(t,e);var a=Object(o.a)(t);function t(){return Object(r.a)(this,t),a.apply(this,arguments)}return Object(l.a)(t,[{key:"render",value:function(){return c.a.createElement("div",{className:"content-header row"},c.a.createElement("div",{className:"content-header-left col-md-9 col-12 mb-2"},c.a.createElement("div",{className:"row breadcrumbs-top"},c.a.createElement("div",{className:"breadcrumb-wrapper vx-breadcrumbs d-sm-block d-none col-12"},c.a.createElement(s.a,{tag:"ol"},c.a.createElement(m.a,{tag:"li"},c.a.createElement(d.b,{to:"/pages/HomePage"},c.a.createElement(u.a,{className:"align-top",size:20}))),c.a.createElement(m.a,{tag:"li",className:"text-primary"},this.props.breadCrumbParent),this.props.breadCrumbParent2?c.a.createElement(m.a,{tag:"li",className:"text-primary"},this.props.breadCrumbParent2):"",this.props.breadCrumbParent3?c.a.createElement(m.a,{tag:"li",className:"text-primary"},this.props.breadCrumbParent3):"",c.a.createElement(m.a,{tag:"li",active:!0},this.props.breadCrumbActive))))),c.a.createElement("div",{className:"content-header-right text-md-right col-md-3 col-12 d-md-block d-none"}))}}]),t}(c.a.Component);a.a=p},749:function(e,a,t){e.exports=t.p+"static/media/user-03.0fc73648.jpg"}}]);
//# sourceMappingURL=17.df9c1cbc.chunk.js.map