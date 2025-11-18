import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function groupByMonth(collectionData, timestampField = "createdAt") {
  const map = {};
  collectionData.forEach((doc) => {
    if (!doc[timestampField]) return;

    let date;
    if (doc[timestampField]?.toDate) date = doc[timestampField].toDate();
    else date = new Date(doc[timestampField]);

    if (isNaN(date)) return;

    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    map[monthKey] = (map[monthKey] || 0) + 1;
  });

  // Sort keys chronologically
  return Object.entries(map)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .reduce((acc, [k, v]) => {
      acc.labels.push(
        new Date(k + "-01").toLocaleString("default", { month: "short", year: "numeric" })
      );
      acc.values.push(v);
      return acc;
    }, { labels: [], values: [] });
}

function renderChart(ctxId, data, label, color) {
  const ctx = document.getElementById(ctxId).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [{
        label,
        data: data.values,
        borderColor: color,
        backgroundColor: color + "33",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#475569" }},
        y: { ticks: { color: "#475569" }, beginAtZero: true },
      },
      plugins: { legend: { display: false }},
      animation: { duration: 800, easing: "easeOutQuart" }
    },
  });
}

export async function loadAnalytics() {
    const collectionsToPlot = [
        { name:"shops",id:"shopsChart",label:"Shops",color:"#0ea5e9"},
        { name:"offers",id:"offersChart",label:"Offers",color:"#f97316"},
        { name:"users",id:"usersChart",label:"Users",color:"#10b981"},
    ];
    for (const { name, id, label, color } of collectionsToPlot) {
    const snap = await getDocs(collection(db, name));
    const groupedData = groupByMonth(snap.docs.map((d) => d.data()));
    renderChart(id, groupedData, label, color);
  }
}