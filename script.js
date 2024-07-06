$(document).ready(function() {
    // DataTable initialization
    $('#example').DataTable({
        "dom": '<"top"lf<"info-container">>rt<"bottom"ipB><"clear">',
        "paging": true,
        "autoWidth": true,
        "buttons": [
            {
                text: 'Download as PDF',
                extend: 'pdfHtml5',
                filename: 'ICS_attacks_pdf',
                orientation: 'landscape', // portrait
                pageSize: 'A4', // A3, A5, A6, legal, letter
                exportOptions: {
                    columns: ':visible',
                    search: 'applied',
                    order: 'applied'
                },
                customize: function (doc) {
                    // Remove the title created by DataTables
                    doc.content.splice(0, 1);
                    // Create a date string that we use in the footer. Format is yyyy-mm-dd
                    var now = new Date();
                    var jsDate = now.getFullYear() + '-' + 
                                 ('0' + (now.getMonth() + 1)).slice(-2) + '-' + 
                                 ('0' + now.getDate()).slice(-2);

                    // Set page margins [left, top, right, bottom]
                    doc.pageMargins = [40, 60, 40, 30];
                    // Set the font size for the entire document
                    doc.defaultStyle.fontSize = 7;
                    // Set the font size for the table header
                    doc.styles.tableHeader.fontSize = 7;

                    // Create header and footer objects
                    doc['header'] = (function(page, pages) {
                        if (page === 1) {
                            return {
                                columns: [
                                    {
                                        alignment: 'center',
                                        text: 'ICS Attacks',
                                        fontSize: 14,
                                        bold: true
                                    }
                                ],
                                margin: [0, 20, 0, 20]
                            };
                        } else {
                            return;
                        }
                    });

                    doc['footer'] = (function(page, pages) {
                        return {
                            columns: [
                                {
                                    alignment: 'left',
                                    text: ['Created on: ', { text: jsDate.toString() }]
                                },
                                {
                                    alignment: 'right',
                                    text: ['page ', { text: page.toString() }, ' of ', { text: pages.toString() }]
                                }
                            ],
                            margin: [40, 0]
                        };
                    });

                    // Change DataTable layout (Table styling)
                    var objLayout = {};
                    objLayout['hLineWidth'] = function(i) { return .5; };
                    objLayout['vLineWidth'] = function(i) { return .5; };
                    objLayout['hLineColor'] = function(i) { return '#aaa'; };
                    objLayout['vLineColor'] = function(i) { return '#aaa'; };
                    objLayout['paddingLeft'] = function(i) { return 4; };
                    objLayout['paddingRight'] = function(i) { return 4; };
                    doc.content[0].layout = objLayout;

                    // Center the table by wrapping it in columns with flexible width
                    var tableBody = doc.content[0].table.body;
                    doc.content[0] = {
                        columns: [
                            { width: '*', text: '' },
                            {
                                width: 'auto',
                                table: {
                                    headerRows: 1,
                                    body: tableBody,
                                    alignment: "center"
                                },
                                layout: objLayout
                            },
                            { width: '*', text: '' }
                        ]
                    };
                }
            }
        ],
        "initComplete": function(settings, json) {
            $('.info-container').append($('.dataTables_info'));
        }
    });
});
