function showBrief(details) {
    try {
        const detailObj = JSON.parse(details);
        const overlay = document.getElementById('overlay');
        const overlayContent = document.getElementById('overlay-content');

        overlayContent.innerHTML = `
            <h2>${detailObj["Attack/Campaign Name"]}</h2>
            <p><strong>Targeted Infrastructure:</strong> ${detailObj["Targetted Infrastructure"]}</p>
            <p><strong>Year:</strong> ${detailObj.Year}</p>
            <p><strong>Sophistication:</strong> ${detailObj.Sophistication}</p>
            <p><strong>Scale:</strong> ${detailObj.Scale}</p>
            <p><strong>Country:</strong> ${detailObj.Country}</p>
            <p><strong>Attacker Type:</strong> ${detailObj["Attacker Type"]}</p>
            <p><strong>Initial Access:</strong> ${detailObj["Initial Access"]}</p>
            <p><strong>Impact:</strong> ${detailObj.Impact}</p>
            <p><strong>Attacker Name:</strong> ${detailObj["Attacker Name"]}</p>
            <p><strong>Story:</strong> ${detailObj.Story}</p>
        `;

        overlay.style.display = 'flex';
    } catch (error) {
        console.error("Error parsing details:", error, details);
    }
}

function applyCustomStyles() {
    $('#example').on('draw.dt', function() {
        $('tbody td').removeClass('sorting_1 sorting_2 sorting_3');
        $('tbody td').css('background-color', 'transparent');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', function (event) {
            if (link.getAttribute('href').startsWith('#') || link.getAttribute('target') === '_blank') {
                return;
            }

            event.preventDefault();
            const href = link.getAttribute('href');

            document.body.classList.add('fade-out');

            fetch(href)
                .then(response => response.text())
                .then(html => {
                    setTimeout(() => {
                        document.open();
                        document.write(html);
                        document.close();
                        document.body.classList.add('fade-in');
                    }, 200);
                });
        });
    });

    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) {
            document.body.classList.add('fade-in');
        }
    });

    function populateTable(data) {
        const tableBody = $('#example tbody');
        tableBody.empty();

        data.forEach(row => {
            const jsonRow = encodeURIComponent(JSON.stringify(row));
            const tableRow = `
                <tr>
                    <td>${row["Attack/Campaign Name"]}</td>
                    <td>${row["Targetted Infrastructure"]}</td>
                    <td>${row.Year}</td>
                    <td>${row.Country}</td>
                    <td>${row["Initial Access"]}</td>
                    <td><span class="brief-icon" data-details="${jsonRow}"></span></td>
                </tr>`;
            tableBody.append(tableRow);
        });

        $('#example').DataTable({
            dom: '<"top"lf<"info-container">>rt<"bottom"ipB><"clear">',
            paging: true,
            autoWidth: false,
            responsive: true,
            buttons: [
                {
                    text: 'Download as PDF',
                    extend: 'pdfHtml5',
                    filename: 'ICS_attacks_pdf',
                    orientation: 'landscape',
                    pageSize: 'A4',
                    exportOptions: {
                        columns: ':visible',
                        search: 'applied',
                        order: 'applied'
                    },
                    customize: function (doc) {
                        doc.content.splice(0, 1);
                        const now = new Date();
                        const jsDate = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
                        doc.pageMargins = [40, 60, 40, 30];
                        doc.defaultStyle.fontSize = 7;
                        doc.styles.tableHeader.fontSize = 7;

                        doc['header'] = function(page, pages) {
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
                        };

                        doc['footer'] = function(page, pages) {
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
                        };

                        const objLayout = {};
                        objLayout['hLineWidth'] = function(i) { return .5; };
                        objLayout['vLineWidth'] = function(i) { return .5; };
                        objLayout['hLineColor'] = function(i) { return '#aaa'; };
                        objLayout['vLineColor'] = function(i) { return '#aaa'; };
                        objLayout['paddingLeft'] = function(i) { return 4; };
                        objLayout['paddingRight'] = function(i) { return 4; };
                        doc.content[0].layout = objLayout;

                        const tableBody = doc.content[0].table.body;
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
            drawCallback: function (settings) {
                // Re-attach event listener for brief icons
                $('.brief-icon').off('click').on('click', function() {
                    const details = decodeURIComponent($(this).data('details'));
                    showBrief(details);
                });

                // Remove some default styles
                applyCustomStyles();
            },
            initComplete: function(settings, json) {
                $('.info-container').append($('.dataTables_info'));
                $('#example').show();

                // Attach the event listener for the brief icons for the first time
                $('.brief-icon').on('click', function() {
                    const details = decodeURIComponent($(this).data('details'));
                    showBrief(details);
                });
            },
            columnDefs: [
                { orderable: false, targets: 5 },
                { className: "dt-center", targets: "_all" }
            ]
        });
    }

    document.getElementById('overlay').addEventListener('click', function() {
        this.style.display = 'none';
    });

    $.ajax({
        url: 'attacks.csv',
        dataType: 'text',
    }).done(function(data) {
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                populateTable(results.data);
                applyCustomStyles();
            }
        });
    });
});
