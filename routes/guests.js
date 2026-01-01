const express = require("express");
const fs = require("fs");
const path = require("path");
const router=express.Router();

const dbpath=path.join(__dirname,"../guests.json");

const readDB = () => {
    const file=fs.readFileSync(dbpath,"utf8");
    return JSON.parse(file);
};

const writeDB = (data) => {
    fs.writeFileSync(dbpath,JSON.stringify(data,null,2));
};

router.get("/",(req,res) => {
    const db=readDB();
    res.json(db.guests);
});

router.get("/:id",(req,res) => {
    const db = readDB();
    const guest = db.guests.find(
        (g) => g.id === parseInt(req.params.id)
    );
    if(!guest) return res.status(404).json({error: "Not found"});
    res.json(guest);
});

router.post("/batch", (req, res) => {
  const db = readDB();
  const newGuests = req.body.guests;
  const addedGuests=[];
  newGuests.forEach(item =>{
    const guest={
        id: item.id,
        name: item.name,
        table_number: item.table_number,
        order: item.order
    };
    db.guests.push(guest);
    addedGuests.push(guest);
  });
  writeDB(db);
  res.status(201).json({addedCount:addedGuests.length,
    addedGuests:addedGuests});
});

router.put("/batch", (req, res) => {
  const db = readDB();
  const updates = req.body.guests;
  const updatedItems=[];

  updates.forEach(u => {
    const idx = db.guests.findIndex(g => g.id === u.id);
    if (idx !== -1) {
      const existing=db.guests[idx];  
      db.guests[idx] = {
        id: u.id,
        name: u.name,
        table_number: u.table_number,
        order: u.order
      };
      updatedItems.push(db.guests[idx]);
    }
  });

  writeDB(db);
  res.json({ updatedCount: updatedItems.length,
    updatedRows:updatedItems
   });
});

router.delete("/batch", (req, res) => {
  const db = readDB();
  const ids = req.body.ids; // list of ids to delete

  db.guests = db.guests.filter(g => !ids.includes(g.id));
  writeDB(db);

  res.json({ deleted: ids.length });
});

module.exports=router;