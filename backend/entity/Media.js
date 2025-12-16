const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Media", // Will use table name `media` by default
    tableName: "media",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        url: {
            type: "text",
        },
        type: {
            type: "varchar",
        },
        s3_key: {
            type: "text",
            nullable: true,
        },
        created_at: {
            type: "datetime",
            createDate: true, // Automatically manages created_at
        },
    },
});
