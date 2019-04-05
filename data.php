<?php

$path = realpath('path');
$dir = scandir($path);
$data = [];
foreach ($dir as $value) {
    if ($value[0] == '.') {
        continue;
    }
    $thisPath = $path.DIRECTORY_SEPARATOR.$value;
    if (is_dir($thisPath)) {
        $files = scandir($thisPath);
        foreach ($files as $file) {
            if ($file[0] == '.') {
                continue;
            }
            $thisFile = $thisPath.DIRECTORY_SEPARATOR.$file;
            if (is_file($thisFile)) {
                $part = array_map('trim', explode('---', file_get_contents($thisFile)));
                if (count($part) != 3) {
                    continue;
                }
                $data[] = [
                  'name' => json_decode(trim(str_replace('\ufeff', '', json_encode($part[0])))),
                  'level' => $part[1],
                  'path' => json_decode('['.trim($part[2], ',').']', true)
                ];
            }
        }
    }
}

$json = [
  'type' => 'FeatureCollection',
  'features' => []
];

foreach ($data as $key => $value) {
    $json['features'][] = [
    'type' => 'Feature',
    'id' => 'id-'.$key,
    'properties' => [
      'name' => $value['name'],
      'level' => $value['level']
    ],
    'geometry' => [
      'type' => 'Polygon',
      'coordinates' => [$value['path']]
    ]
  ];
}
header('Content-Type: application/json');
echo json_encode($json);
