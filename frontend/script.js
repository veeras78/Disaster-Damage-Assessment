// ============================================
// DISASTER DAMAGE ASSESSMENT
// JavaScript
// ============================================


// --------------------------------------------
// GET ELEMENT
// --------------------------------------------

function get(id) {
    return document.getElementById(id);
}


// --------------------------------------------
// PAGE NAVIGATION
// --------------------------------------------

function showPage(pageName) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    get(pageName).classList.add("active");


    const buttons = document.querySelectorAll(".nav-btn");

    buttons.forEach(function(button) {
        button.classList.remove("active");
    });

    if (pageName === "dashboard") {
        buttons[0].classList.add("active");
    }

    if (pageName === "assessment") {
        buttons[1].classList.add("active");
    }

    if (pageName === "records") {
        buttons[2].classList.add("active");

        displayRecords();
    }
}


// --------------------------------------------
// DAMAGE CALCULATION
// --------------------------------------------

const damageSelects =
    document.querySelectorAll(".damage-select");


damageSelects.forEach(function(select) {

    select.addEventListener("change", calculateDamage);

});


function calculateDamage() {

    let total = 0;

    let totalWeight = 0;

    let structuralScore = 0;


    damageSelects.forEach(function(select) {

        const value = Number(select.value);

        const weight = Number(select.dataset.weight);


        total += (value / 4) * weight;

        totalWeight += weight;


        // Structure is the third component
        if (select.dataset.weight === "0.20") {
            structuralScore = value;
        }

    });


    if (totalWeight === 0) {

        get("damagePercentage").textContent = "0%";

        get("damageCategory").textContent =
            "No Assessment";

        return;
    }


    const percentage =
        Math.round((total / totalWeight) * 100);


    get("damagePercentage").textContent =
        percentage + "%";


    let category = "";


    if (percentage < 10) {

        category = "Affected";

    }
    else if (percentage < 30) {

        category = "Minor Damage";

    }
    else if (percentage < 60) {

        category = "Major Damage";

    }
    else {

        category = "Destroyed";

    }


    get("damageCategory").textContent = category;


    // Safety placard

    let placard = "";


    if (percentage >= 60 || structuralScore >= 4) {

        placard = "⚫ UNSAFE";

    }
    else if (percentage >= 30 || structuralScore >= 3) {

        placard = "🔴 RESTRICTED";

    }
    else {

        placard = "🟢 INSPECTED";

    }


    get("placard").textContent = placard;
}


// --------------------------------------------
// PHOTO UPLOAD
// --------------------------------------------

let uploadedPhotos = [];


get("photoInput").addEventListener("change", function(event) {

    const files = event.target.files;

    uploadedPhotos = [];

    get("photoPreview").innerHTML = "";


    Array.from(files).slice(0, 3).forEach(function(file) {

   const formData = new FormData();
   formData.append("image", file);

   fetch("http://127.0.0.1:5000/upload", {
    method: "POST",
    body: formData
})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    console.log("Backend upload:", data);
})
.catch(function(error) {
    console.log("Upload error:", error);
});

        const reader = new FileReader();


        reader.onload = function(e) {

            uploadedPhotos.push(e.target.result);


            const img = document.createElement("img");

            img.src = e.target.result;

            get("photoPreview").appendChild(img);

        };


        reader.readAsDataURL(file);

    });

});


// --------------------------------------------
// GPS
// --------------------------------------------

get("gpsBtn").addEventListener("click", function() {

    if (!navigator.geolocation) {

        get("gpsResult").textContent =
            "GPS is not supported by this browser.";

        return;
    }


    get("gpsResult").textContent =
        "Getting location...";


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            const gps =
                latitude + ", " + longitude;


            get("gps").value = gps;


            get("gpsResult").textContent =
                "📍 Location: " + gps;

        },

        function() {

            get("gpsResult").textContent =
                "Unable to get GPS location.";

        }

    );

});


// --------------------------------------------
// SAVE RECORD
// --------------------------------------------

get("assessmentForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const percentage =
            parseInt(
                get("damagePercentage").textContent
            );


        if (!get("eventName").value.trim()) {

            alert("Please enter the disaster/event name.");

            return;
        }


        if (!get("inspector").value.trim()) {

            alert("Please enter inspector name.");

            return;
        }


        if (!get("address").value.trim()) {

            alert("Please enter the property address.");

            return;
        }


        const record = {

            id: Date.now(),

            eventName:
                get("eventName").value,

            inspector:
                get("inspector").value,

            address:
                get("address").value,

            zone:
                get("zone").value,

            owner:
                get("owner").value,

            occupancy:
                get("occupancy").value,

            hazard:
                get("hazard").value,

            construction:
                get("construction").value,

            waterline:
                get("waterline").value,

            occupants:
                get("occupants").value,

            displaced:
                get("displaced").value,

            injuries:
                get("injuries").value,

            cost:
                get("cost").value,

            utilities:
                get("utilities").value,

            access:
                get("access").value,

            notes:
                get("notes").value,

            gps:
                get("gps").value,

            damage:
                percentage,

            photos:
                uploadedPhotos,

            date:
                new Date().toLocaleString()

        };


        let records =
            JSON.parse(
                localStorage.getItem(
                    "damageRecords"
                )
            ) || [];


        records.push(record);


        localStorage.setItem(
            "damageRecords",
            JSON.stringify(records)
        );


        alert(
            "✅ Assessment saved successfully!"
        );


        clearForm();

        updateDashboard();

        displayRecords();

        showPage("records");

    }
);


// --------------------------------------------
// CLEAR FORM
// --------------------------------------------

function clearForm() {

    get("assessmentForm").reset();

    get("gps").value = "";

    get("gpsResult").textContent =
        "Location not captured";

    get("photoPreview").innerHTML = "";

    uploadedPhotos = [];


    damageSelects.forEach(function(select) {

        select.value = "0";

    });


    calculateDamage();
}


get("clearBtn").addEventListener(
    "click",
    clearForm
);


// --------------------------------------------
// GET RECORDS
// --------------------------------------------

function getRecords() {

    return JSON.parse(
        localStorage.getItem("damageRecords")
    ) || [];

}


// --------------------------------------------
// DISPLAY RECORDS
// --------------------------------------------

function displayRecords() {

    const container =
        get("recordsContainer");


    let records = getRecords();


    const search =
        get("searchInput").value.toLowerCase();


    records = records.filter(function(record) {

        return (

            record.eventName.toLowerCase().includes(search) ||

            record.address.toLowerCase().includes(search) ||

            record.inspector.toLowerCase().includes(search) ||

            record.hazard.toLowerCase().includes(search)

        );

    });


    if (records.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No assessment records found.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    records.reverse().forEach(function(record) {

        let category;


        if (record.damage < 10) {

            category = "Affected";

        }
        else if (record.damage < 30) {

            category = "Minor Damage";

        }
        else if (record.damage < 60) {

            category = "Major Damage";

        }
        else {

            category = "Destroyed";

        }


        const card =
            document.createElement("div");


        card.className = "record-card";


        card.innerHTML = `

            <div class="record-header">

                <div>

                    <h3>
                        ${record.eventName}
                    </h3>

                    <small>
                        ${record.date}
                    </small>

                </div>

                <strong>
                    ${record.damage}%
                </strong>

            </div>


            <div class="record-details">

                <div>
                    <strong>Inspector</strong><br>
                    ${record.inspector}
                </div>

                <div>
                    <strong>Address</strong><br>
                    ${record.address}
                </div>

                <div>
                    <strong>Disaster</strong><br>
                    ${record.hazard || "Not specified"}
                </div>

                <div>
                    <strong>Category</strong><br>
                    ${category}
                </div>

                <div>
                    <strong>Displaced</strong><br>
                    ${record.displaced || 0}
                </div>

                <div>
                    <strong>Estimated Cost</strong><br>
                    ₹${record.cost || 0}
                </div>

            </div>


            <div class="record-actions">

                <button
                    class="delete-btn"
                    onclick="deleteRecord(${record.id})">

                    🗑️ Delete

                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


// --------------------------------------------
// DELETE RECORD
// --------------------------------------------

function deleteRecord(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this record?"
        );


    if (!confirmDelete) {
        return;
    }


    let records = getRecords();


    records = records.filter(function(record) {

        return record.id !== id;

    });


    localStorage.setItem(
        "damageRecords",
        JSON.stringify(records)
    );


    fetch("http://127.0.0.1:5000/assess", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(record)
})
.then(function(response) {
    return response.json();
})
.then(function(data) {
    console.log("Backend response:", data);
})
.catch(function(error) {
    console.log("Backend connection error:", error);
});


alert(
    "✅ Assessment saved successfully!"
);
   displayRecords();

    updateDashboard();

}


// --------------------------------------------
// SEARCH
// --------------------------------------------

get("searchInput").addEventListener(
    "input",
    displayRecords
);


// --------------------------------------------
// DASHBOARD
// --------------------------------------------

function updateDashboard() {

    const records = getRecords();


    let minor = 0;

    let moderate = 0;

    let severe = 0;

    let totalDamage = 0;


    records.forEach(function(record) {

        if (record.damage < 30) {

            minor++;

        }
        else if (record.damage < 60) {

            moderate++;

        }
        else if (record.damage < 100) {

            severe++;

        }
        else {

            totalDamage++;

        }

    });


    get("totalSurveys").textContent =
        records.length;

    get("minorCount").textContent =
        minor;

    get("moderateCount").textContent =
        moderate;

    get("severeCount").textContent =
        severe;

    get("totalDamageCount").textContent =
        totalDamage;

}


// --------------------------------------------
// EXPORT CSV
// --------------------------------------------

get("exportBtn").addEventListener(
    "click",
    exportCSV
);


function exportCSV() {

    const records = getRecords();


    if (records.length === 0) {

        alert("No records to export.");

        return;

    }


    let csv =
        "Event,Inspector,Address,Zone,Hazard,Damage %,Category,Displaced,Cost,Date\n";


    records.forEach(function(record) {

        let category;


        if (record.damage < 10) {

            category = "Affected";

        }
        else if (record.damage < 30) {

            category = "Minor";

        }
        else if (record.damage < 60) {

            category = "Major";

        }
        else {

            category = "Destroyed";

        }


        csv += [

            record.eventName,

            record.inspector,

            record.address,

            record.zone,

            record.hazard,

            record.damage,

            category,

            record.displaced,

            record.cost,

            record.date

        ].map(function(value) {

            return '"' +
                String(value || "")
                .replace(/"/g, '""') +
                '"';

        }).join(",") + "\n";

    });


    const blob =
        new Blob(
            [csv],
            { type: "text/csv" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "damage-assessment-records.csv";


    link.click();


    URL.revokeObjectURL(url);

}


// --------------------------------------------
// DARK MODE
// --------------------------------------------

get("themeBtn").addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        if (
            document.body.classList.contains("dark")
        ) {

            get("themeBtn").textContent =
                "☀️ Light Mode";

        }
        else {

            get("themeBtn").textContent =
                "🌙 Dark Mode";

        }

    }
);


// --------------------------------------------
// START APPLICATION
// --------------------------------------------

calculateDamage();

updateDashboard();

displayRecords();