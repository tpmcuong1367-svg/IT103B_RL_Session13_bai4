const FLIGHT_NUMBER = "VN-210";
const FLIGHT_ROUTE = "SGN - HAN";
const PAYLOAD_CAPACITY_KG = 5000;
const WARNING_RATIO = 0.85;
const MAX_PIECE_KG = 1000;
const MAX_DESCRIPTION_LENGTH = 40;
const MANIFEST_WIDTH = 72;

const ZONES = ["ZONE_COLD", "ZONE_FRAGILE", "ZONE_STANDARD"];

const CATEGORIES = {
    "1": { code: "FRESH_FOOD", label: "Thuc pham tuoi song", zone: "ZONE_COLD" },
    "2": { code: "ELECTRONICS", label: "Do dien tu", zone: "ZONE_FRAGILE" },
    "3": { code: "GLASS", label: "Thuy tinh", zone: "ZONE_FRAGILE" },
    "4": { code: "LUGGAGE", label: "Hanh ly vali thuong", zone: "ZONE_STANDARD" }
};

const cargoList = [
    { cargoId: "CG-001", description: "Tom hum dong lanh", category: "FRESH_FOOD", weightKg: 320, zone: "ZONE_COLD", flightNumber: FLIGHT_NUMBER },
    { cargoId: "CG-002", description: "Lo man hinh LED", category: "ELECTRONICS", weightKg: 540, zone: "ZONE_FRAGILE", flightNumber: FLIGHT_NUMBER },
    { cargoId: "CG-003", description: "Vali hanh khach doan tour", category: "LUGGAGE", weightKg: 860, zone: "ZONE_STANDARD", flightNumber: FLIGHT_NUMBER },
    { cargoId: "CG-004", description: "Binh gom thuy tinh", category: "GLASS", weightKg: 140, zone: "ZONE_FRAGILE", flightNumber: FLIGHT_NUMBER }
];

let nextCargoNumber = cargoList.length + 1;

function formatKg(value) {
    return `${Number(value.toFixed(1)).toLocaleString("en-US")} kg`;
}

function generateCargoId() {
    const id = `CG-${String(nextCargoNumber).padStart(3, "0")}`;
    nextCargoNumber++;
    return id;
}

function allocateZone(categoryCode) {
    const keys = Object.keys(CATEGORIES);
    for (let i = 0; i < keys.length; i++) {
        if (CATEGORIES[keys[i]].code === categoryCode) {
            return CATEGORIES[keys[i]].zone;
        }
    }
    return null;
}

function calculateTotalWeight(list) {
    return list.reduce(function (sum, cargo) {
        return sum + cargo.weightKg;
    }, 0);
}

function calculateLoadRatio(totalWeightKg) {
    return totalWeightKg / PAYLOAD_CAPACITY_KG;
}

function getLoadStatus(totalWeightKg) {
    const ratio = calculateLoadRatio(totalWeightKg);
    if (ratio >= 1) {
        return "FULL";
    }
    if (ratio > WARNING_RATIO) {
        return "WARNING";
    }
    return "NORMAL";
}

function canAcceptCargo(weightKg) {
    const currentKg = calculateTotalWeight(cargoList);
    return currentKg < PAYLOAD_CAPACITY_KG && currentKg + weightKg <= PAYLOAD_CAPACITY_KG;
}

function parseWeight(input) {
    const text = String(input).trim().replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(text)) {
        return NaN;
    }
    return Number(text);
}

function printLoadSignal(totalWeightKg) {
    const status = getLoadStatus(totalWeightKg);
    const percent = Number((calculateLoadRatio(totalWeightKg) * 100).toFixed(1));
    const summary = `${formatKg(totalWeightKg)} / ${formatKg(PAYLOAD_CAPACITY_KG)} (${percent}%)`;
    if (status === "FULL") {
        console.log(`%c[DO] KHOANG DA DAY TAI - ${summary}. Tu choi nhan them kien hang.`, "color: #d32f2f; font-weight: bold;");
    } else if (status === "WARNING") {
        console.log(`%c[VANG] CANH BAO: Tai trong vuot 85% dinh muc - ${summary}.`, "color: #f9a825; font-weight: bold;");
    } else {
        console.log(`%c[XANH] An toan - ${summary}.`, "color: #2e7d32; font-weight: bold;");
    }
}

function promptRequired(message) {
    const input = prompt(message);
    if (input === null) {
        return null;
    }
    const value = input.trim();
    if (value === "") {
        console.log("Du lieu khong duoc de trong.");
        return null;
    }
    return value;
}

function addCargo() {
    const currentKg = calculateTotalWeight(cargoList);
    if (getLoadStatus(currentKg) === "FULL") {
        printLoadSignal(currentKg);
        return;
    }

    const description = promptRequired("Nhập mô tả kiện hàng:");
    if (description === null) {
        return;
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
        console.log(`Mo ta qua dai (toi da ${MAX_DESCRIPTION_LENGTH} ky tu).`);
        return;
    }

    const categoryInput = promptRequired("Loại kiện hàng:\n1. Thực phẩm tươi sống\n2. Đồ điện tử\n3. Thủy tinh\n4. Hành lý vali thường\n\nNhập lựa chọn (1-4):");
    if (categoryInput === null) {
        return;
    }
    const category = CATEGORIES[categoryInput];
    if (category === undefined) {
        console.log("Loai kien hang khong hop le. Vui long chon tu 1 den 4.");
        return;
    }

    const weightInput = promptRequired(`Nhập trọng lượng kiện hàng (kg, lớn hơn 0 và tối đa ${MAX_PIECE_KG}):`);
    if (weightInput === null) {
        return;
    }
    const weightKg = parseWeight(weightInput);
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > MAX_PIECE_KG) {
        console.log(`Trong luong khong hop le. Vui long nhap so tu 0.1 den ${MAX_PIECE_KG} kg.`);
        return;
    }

    if (!canAcceptCargo(weightKg)) {
        const remaining = PAYLOAD_CAPACITY_KG - currentKg;
        console.log(`%c[TU CHOI] Kien ${formatKg(weightKg)} lam tong tai vuot 100% dinh muc. Tai trong con lai: ${formatKg(remaining)}.`, "color: #d32f2f; font-weight: bold;");
        return;
    }

    const cargo = {
        cargoId: generateCargoId(),
        description: description,
        category: category.code,
        weightKg: weightKg,
        zone: allocateZone(category.code),
        flightNumber: FLIGHT_NUMBER
    };
    cargoList.push(cargo);
    console.log(`Da nhap kien ${cargo.cargoId} "${cargo.description}" (${formatKg(cargo.weightKg)}) vao ${cargo.zone}.`);
    printLoadSignal(calculateTotalWeight(cargoList));
}

function listCargoByZone() {
    if (cargoList.length === 0) {
        console.log("Kho hien chua co kien hang nao.");
        return;
    }
    ZONES.forEach(function (zone) {
        const items = cargoList.filter(function (cargo) {
            return cargo.zone === zone;
        });
        console.log(`\n--- ${zone}: ${items.length} kien, ${formatKg(calculateTotalWeight(items))} ---`);
        if (items.length === 0) {
            console.log("(Phan khu trong)");
            return;
        }
        console.table(items.map(function (cargo) {
            return {
                "Ma kien": cargo.cargoId,
                "Mo ta": cargo.description,
                "Loai": cargo.category,
                "Trong luong (kg)": cargo.weightKg
            };
        }));
    });
}

function checkOverloadWarning() {
    const totalKg = calculateTotalWeight(cargoList);
    const percent = Number((calculateLoadRatio(totalKg) * 100).toFixed(1));
    const remaining = Math.max(0, PAYLOAD_CAPACITY_KG - totalKg);
    console.log(`Chuyen bay ${FLIGHT_NUMBER} - Tai trong dinh muc: ${formatKg(PAYLOAD_CAPACITY_KG)}`);
    console.log(`Tong trong luong hien tai: ${formatKg(totalKg)} (${percent}%)`);
    console.log(`Tai trong con lai: ${formatKg(remaining)} | Nguong canh bao 85%: ${formatKg(PAYLOAD_CAPACITY_KG * WARNING_RATIO)}`);
    printLoadSignal(totalKg);
}

function displayCargoManifest() {
    if (cargoList.length === 0) {
        console.log("Kho chua co kien hang, khong the xuat Cargo Manifest.");
        return;
    }
    const heavy = "=".repeat(MANIFEST_WIDTH);
    const light = "-".repeat(MANIFEST_WIDTH);
    const totalKg = calculateTotalWeight(cargoList);
    const percent = Number((calculateLoadRatio(totalKg) * 100).toFixed(1));
    const now = new Date();
    const title = "CARGO MANIFEST";
    const lines = [];

    lines.push(heavy);
    lines.push(`${" ".repeat(Math.floor((MANIFEST_WIDTH - title.length) / 2))}${title}`);
    lines.push(heavy);
    lines.push(`${"Chuyen bay".padEnd(14)}: ${FLIGHT_NUMBER} (${FLIGHT_ROUTE})`);
    lines.push(`${"Thoi gian".padEnd(14)}: ${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN")}`);
    lines.push(`${"Tai dinh muc".padEnd(14)}: ${formatKg(PAYLOAD_CAPACITY_KG)}`);
    lines.push(light);
    lines.push(`${"STT".padEnd(5)}${"Ma kien".padEnd(10)}${"Mo ta".padEnd(32)}${"Phan khu".padEnd(15)}${"Kg".padStart(10)}`);
    lines.push(light);

    let index = 1;
    ZONES.forEach(function (zone) {
        cargoList.filter(function (cargo) {
            return cargo.zone === zone;
        }).forEach(function (cargo) {
            const description = cargo.description.length > 30 ? `${cargo.description.slice(0, 29)}.` : cargo.description;
            lines.push(`${String(index).padEnd(5)}${cargo.cargoId.padEnd(10)}${description.padEnd(32)}${cargo.zone.padEnd(15)}${String(Number(cargo.weightKg.toFixed(1))).padStart(10)}`);
            index++;
        });
    });

    lines.push(light);
    ZONES.forEach(function (zone) {
        const items = cargoList.filter(function (cargo) {
            return cargo.zone === zone;
        });
        const label = `${zone}: ${items.length} kien`;
        lines.push(`${label.padEnd(MANIFEST_WIDTH - 12)}${formatKg(calculateTotalWeight(items)).padStart(12)}`);
    });
    lines.push(heavy);
    const totalLabel = `TONG: ${cargoList.length} kien (${percent}% tai trong)`;
    lines.push(`${totalLabel.padEnd(MANIFEST_WIDTH - 12)}${formatKg(totalKg).padStart(12)}`);
    lines.push(`Trang thai tai trong: ${getLoadStatus(totalKg)}`);
    lines.push(heavy);

    console.log(lines.join("\n"));
}

function showMenu() {
    console.log(`\n====== DIEU PHOI KHO HANG HOA - CHUYEN BAY ${FLIGHT_NUMBER} ======`);
    console.log("1. Nhap kien hang moi vao kho");
    console.log("2. Bang kiem ke kien hang theo phan khu");
    console.log("3. Kiem tra canh bao qua tai trong an toan");
    console.log("4. Xuat danh muc boc do (Cargo Manifest)");
    console.log("0. Thoat");
    console.log("=====================================================");
}

function readMenuChoice() {
    const input = prompt(
        `ĐIỀU PHỐI KHO HÀNG HÓA - ${FLIGHT_NUMBER}\n1. Nhập kiện hàng mới\n2. Kiểm kê theo phân khu\n3. Kiểm tra cảnh báo quá tải\n4. Xuất Cargo Manifest\n0. Thoát\n\nNhập lựa chọn (0-4):`
    );
    if (input === null) {
        return 0;
    }
    const text = input.trim();
    return text === "" ? -1 : Number(text);
}

function main() {
    let menuChoice;
    do {
        showMenu();
        menuChoice = readMenuChoice();
        switch (menuChoice) {
            case 1:
                addCargo();
                break;
            case 2:
                listCargoByZone();
                break;
            case 3:
                checkOverloadWarning();
                break;
            case 4:
                displayCargoManifest();
                break;
            case 0:
                console.log("Ket thuc ca lam viec. Hen gap lai!");
                break;
            default:
                console.log("Lua chon khong hop le. Vui long nhap so tu 0 den 4.");
        }
    } while (menuChoice !== 0);
}

main();
