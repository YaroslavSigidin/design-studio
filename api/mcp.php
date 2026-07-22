<?php
declare(strict_types=1);

/**
 * Minimal Streamable HTTP MCP endpoint for Согласовано tools.
 * Supports initialize / tools/list / tools/call over JSON-RPC 2.0 POST.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, MCP-Protocol-Version');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(array(
        'ok' => true,
        'server' => 'soglasovano-leads',
        'transport' => 'streamable-http',
        'tools' => array('submit_lead', 'list_cases', 'get_contact_info'),
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('error' => 'Method not allowed'));
    exit;
}

$raw = file_get_contents('php://input');
$rpc = json_decode($raw ? $raw : '{}', true);
if (!is_array($rpc)) {
    http_response_code(400);
    echo json_encode(array('jsonrpc' => '2.0', 'error' => array('code' => -32700, 'message' => 'Parse error'), 'id' => null));
    exit;
}

$id = array_key_exists('id', $rpc) ? $rpc['id'] : null;
$method = isset($rpc['method']) ? (string) $rpc['method'] : '';
$params = isset($rpc['params']) && is_array($rpc['params']) ? $rpc['params'] : array();

function mcp_result($id, $result)
{
    echo json_encode(array(
        'jsonrpc' => '2.0',
        'id' => $id,
        'result' => $result,
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function mcp_error($id, $code, $message)
{
    http_response_code(200);
    echo json_encode(array(
        'jsonrpc' => '2.0',
        'id' => $id,
        'error' => array('code' => $code, 'message' => $message),
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function mcp_tools()
{
    return array(
        array(
            'name' => 'submit_lead',
            'description' => 'Submit a project brief to Согласовано (public lead API).',
            'inputSchema' => array(
                'type' => 'object',
                'properties' => array(
                    'name' => array('type' => 'string'),
                    'phone' => array('type' => 'string'),
                    'contact' => array('type' => 'string'),
                    'service' => array('type' => 'string'),
                    'budget' => array('type' => 'string'),
                    'deadline' => array('type' => 'string'),
                    'comment' => array('type' => 'string'),
                    'source' => array('type' => 'string'),
                ),
                'required' => array('name'),
            ),
        ),
        array(
            'name' => 'list_cases',
            'description' => 'List portfolio cases from the public manifest.',
            'inputSchema' => array(
                'type' => 'object',
                'properties' => array(
                    'limit' => array('type' => 'integer', 'minimum' => 1, 'maximum' => 50),
                ),
            ),
        ),
        array(
            'name' => 'get_contact_info',
            'description' => 'Return public studio contacts.',
            'inputSchema' => array('type' => 'object', 'properties' => new stdClass()),
        ),
    );
}

function mcp_post_lead(array $args)
{
    $payload = array(
        'name' => isset($args['name']) ? trim((string) $args['name']) : '',
        'phone' => isset($args['phone']) ? trim((string) $args['phone']) : '',
        'contact' => isset($args['contact']) ? trim((string) $args['contact']) : '',
        'service' => isset($args['service']) ? trim((string) $args['service']) : '',
        'budget' => isset($args['budget']) ? trim((string) $args['budget']) : '',
        'deadline' => isset($args['deadline']) ? trim((string) $args['deadline']) : '',
        'comment' => isset($args['comment']) ? trim((string) $args['comment']) : '',
        'source' => isset($args['source']) ? trim((string) $args['source']) : 'MCP',
        'privacy' => true,
        'website' => '',
        'company_url' => '',
        'page' => 'https://soglasovano.online/api/mcp.php',
    );

    if ($payload['name'] === '' || ($payload['phone'] === '' && $payload['contact'] === '')) {
        return array('ok' => false, 'error' => 'name and phone/contact required');
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'soglasovano.online';
    $url = $scheme . '://' . $host . '/api/leads.php';

    if (!function_exists('curl_init')) {
        return array('ok' => false, 'error' => 'curl missing');
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'Origin: https://soglasovano.online'),
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ));
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode(is_string($raw) ? $raw : '{}', true);
    return array(
        'ok' => $status >= 200 && $status < 300 && !empty($data['ok']),
        'httpStatus' => $status,
        'response' => is_array($data) ? $data : array('raw' => $raw),
    );
}

function mcp_list_cases($limit)
{
    $limit = max(1, min(50, (int) $limit));
    $path = dirname(__DIR__) . '/data/cases.manifest.json';
    if (!is_readable($path)) {
        return array('ok' => false, 'error' => 'manifest missing');
    }
    $data = json_decode((string) file_get_contents($path), true);
    $projects = array();
    if (isset($data['projects']) && is_array($data['projects'])) {
        $projects = $data['projects'];
    } elseif (isset($data['items']) && is_array($data['items'])) {
        $projects = $data['items'];
    }
    $cases = array();
    foreach (array_slice($projects, 0, $limit) as $project) {
        if (!is_array($project)) {
            continue;
        }
        $id = isset($project['id']) ? (string) $project['id'] : '';
        $cases[] = array(
            'id' => $id,
            'title' => isset($project['title']) ? (string) $project['title'] : '',
            'summary' => isset($project['summary']) ? (string) $project['summary'] : (isset($project['description']) ? (string) $project['description'] : ''),
            'url' => $id !== '' ? 'https://soglasovano.online/case.html?slug=' . rawurlencode($id) : 'https://soglasovano.online/#cases',
        );
    }
    return array('ok' => true, 'count' => count($cases), 'cases' => $cases);
}

if ($method === 'initialize') {
    mcp_result($id, array(
        'protocolVersion' => '2025-03-26',
        'capabilities' => array('tools' => new stdClass()),
        'serverInfo' => array('name' => 'soglasovano-leads', 'version' => '1.0.0'),
    ));
}

if ($method === 'notifications/initialized' || $method === 'initialized') {
    http_response_code(202);
    exit;
}

if ($method === 'ping') {
    mcp_result($id, new stdClass());
}

if ($method === 'tools/list') {
    mcp_result($id, array('tools' => mcp_tools()));
}

if ($method === 'tools/call') {
    $name = isset($params['name']) ? (string) $params['name'] : '';
    $args = isset($params['arguments']) && is_array($params['arguments']) ? $params['arguments'] : array();

    if ($name === 'submit_lead') {
        $out = mcp_post_lead($args);
        mcp_result($id, array(
            'content' => array(array('type' => 'text', 'text' => json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))),
            'structuredContent' => $out,
            'isError' => empty($out['ok']),
        ));
    }

    if ($name === 'list_cases') {
        $out = mcp_list_cases(isset($args['limit']) ? $args['limit'] : 12);
        mcp_result($id, array(
            'content' => array(array('type' => 'text', 'text' => json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))),
            'structuredContent' => $out,
            'isError' => empty($out['ok']),
        ));
    }

    if ($name === 'get_contact_info') {
        $out = array(
            'ok' => true,
            'name' => 'Ярослав Сигидин',
            'telegram' => 'https://t.me/sigidingo',
            'phone' => '+7 961 971-05-15',
            'email' => 'sigidingo@gmail.com',
            'site' => 'https://soglasovano.online',
        );
        mcp_result($id, array(
            'content' => array(array('type' => 'text', 'text' => json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))),
            'structuredContent' => $out,
            'isError' => false,
        ));
    }

    mcp_error($id, -32601, 'Unknown tool');
}

if ($id === null) {
    http_response_code(202);
    exit;
}

mcp_error($id, -32601, 'Method not found: ' . $method);
