const state = {
  uses: parseInt(localStorage.getItem("ns_uses") || "0"),
  limit: 3
};

/* GLOBAL ID (shared across all your sites later) */
function getUserId(){
  let id = localStorage.getItem("ns_user_id");
  if(!id){
    id = crypto.randomUUID();
    localStorage.setItem("ns_user_id", id);
  }
  return id;
}

/* LEAD STAGE ENGINE */
function getStage(score){
  if(score >= 80) return "HOT";
  if(score >= 50) return "WARM";
  return "COLD";
}

/* ROUTER (THIS IS THE IMPORTANT PART) */
function routeLead(stage){

  if(stage === "HOT"){
    return {
      action: "ROOFFLOW",
      message: "Send to RoofFlow AI (high intent)"
    };
  }

  if(stage === "WARM"){
    return {
      action: "NURTURE",
      message: "Keep inside AI system"
    };
  }

  return {
    action: "LOW_INTENT",
    message: "Collect email + retarget"
  };
}

async function analyzeSite(){

  let site = document.getElementById("site").value.trim();
  const email = document.getElementById("email").value.trim();

  const output = document.getElementById("output");
  const btn = document.getElementById("btn");

  if(!site){
    output.innerText = "Enter a website";
    return;
  }

  if(!site.startsWith("http")){
    site = "https://" + site;
  }

  if(state.uses >= state.limit){
    output.innerText = "🚫 Free limit reached — Upgrade to Pro";
    return;
  }

  state.uses++;
  localStorage.setItem("ns_uses", state.uses);

  btn.disabled = true;
  btn.innerText = "Analyzing...";

  output.innerHTML = "Running AI audit...";

  try {

    const res = await fetch("/api/analyze", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        site,
        email,
        user_id: getUserId()
      })
    });

    const data = await res.json();

    const seo = extract(data.result,"SEO Score");
    const ux = extract(data.result,"UX Score");
    const conv = extract(data.result,"Conversion Score");

    /* SIMPLE TOTAL SCORE */
    const score =
      (parseInt(seo) || 0) +
      (parseInt(ux) || 0) +
      (parseInt(conv) || 0);

    const stage = getStage(score);
    const route = routeLead(stage);

    document.getElementById("metrics").style.display = "grid";
    document.getElementById("seo").innerText = seo;
    document.getElementById("ux").innerText = ux;
    document.getElementById("conv").innerText = conv;

    output.innerText =
`AI AUDIT COMPLETE

Score: ${score}
Stage: ${stage}

Routing Decision:
${route.message}`;

    /* AUTO ROUTING (THIS IS YOUR MONEY FLOW) */
    if(route.action === "ROOFFLOW"){
      setTimeout(() => {
        window.location.href =
          "https://goldylox752.github.io/RoofFlow-AI/";
      }, 2000);
    }

  } catch(e){
    output.innerText = "Error running audit";
  }

  btn.disabled = false;
  btn.innerText = "Run Audit";
}

function extract(text,label){
  const match = text.match(new RegExp(label + ":\\s*(\\d+\\/\\d+)"));
  return match ? match[1] : "0/100";
}